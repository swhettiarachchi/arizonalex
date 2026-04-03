const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const SecurityAlert = require('../models/SecurityAlert');
const { sendOTPEmail, sendAlertEmail } = require('../utils/email');
const crypto = require('crypto');

// Helper: get device info from request
function getDeviceInfo(req) {
    const ua = req.headers['user-agent'] || '';
    let browser = 'Unknown', os = 'Unknown', device = 'Desktop';
    if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';
    else if (/Edge/i.test(ua)) browser = 'Edge';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) { os = 'Android'; device = 'Mobile'; }
    else if (/iPhone|iPad/i.test(ua)) { os = 'iOS'; device = 'Mobile'; }
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
    return { browser, os, device, ip, location: 'Local Network' };
}

// ── Change Password ──
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current password and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        // Create security alert
        const info = getDeviceInfo(req);
        await SecurityAlert.create({
            user: user._id, type: 'password_change',
            title: 'Password Changed',
            message: 'Your password was successfully changed. If this wasn\'t you, contact support immediately.',
            ip: info.ip, device: `${info.browser} on ${info.os}`,
        });

        // Send alert email
        try { await sendAlertEmail(user.email, 'Password Changed', 'Your Arizonalex password was just changed. If you did not make this change, please secure your account immediately.'); } catch (e) { console.error('[Email] Alert failed:', e.message); }

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) { next(error); }
};

// ── Request Email Change ──
exports.requestEmailChange = async (req, res, next) => {
    try {
        const { newEmail, password } = req.body;
        if (!newEmail || !password) return res.status(400).json({ success: false, message: 'New email and password are required' });

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Password is incorrect' });

        // Check if email already exists
        const existing = await User.findOne({ email: newEmail.toLowerCase() });
        if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

        // Generate OTP for email verification
        const otp = crypto.randomInt(100000, 999999).toString();
        user.pendingEmail = newEmail.toLowerCase();
        user.emailVerificationCode = crypto.createHash('sha256').update(otp).digest('hex');
        user.emailVerificationExpires = Date.now() + 5 * 60 * 1000;
        await user.save({ validateModifiedOnly: true });

        // Send OTP to new email
        try { await sendOTPEmail(newEmail, otp, 'email_change'); } catch (e) { console.error('[Email] OTP failed:', e.message); }

        res.json({ success: true, message: 'Verification code sent to new email', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
    } catch (error) { next(error); }
};

// ── Verify Email Change ──
exports.verifyEmailChange = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Verification code is required' });

        const user = await User.findById(req.user.id).select('+emailVerificationCode +emailVerificationExpires');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.pendingEmail) return res.status(400).json({ success: false, message: 'No email change pending' });

        const hash = crypto.createHash('sha256').update(code).digest('hex');
        if (user.emailVerificationCode !== hash) return res.status(400).json({ success: false, message: 'Invalid verification code' });
        if (user.emailVerificationExpires < Date.now()) return res.status(400).json({ success: false, message: 'Verification code expired' });

        const oldEmail = user.email;
        user.email = user.pendingEmail;
        user.pendingEmail = undefined;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateModifiedOnly: true });

        // Alert
        const info = getDeviceInfo(req);
        await SecurityAlert.create({
            user: user._id, type: 'email_change',
            title: 'Email Address Changed',
            message: `Your email was changed from ${oldEmail} to ${user.email}.`,
            ip: info.ip, device: `${info.browser} on ${info.os}`,
        });
        try { await sendAlertEmail(oldEmail, 'Email Changed', `Your Arizonalex email has been changed to ${user.email}. If this wasn't you, contact support.`); } catch (e) { console.error('[Email]', e.message); }

        res.json({ success: true, message: 'Email updated successfully', email: user.email });
    } catch (error) { next(error); }
};

// ── Enable 2FA - Step 1: Send OTP ──
exports.enable2FA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+twoFactorCode +twoFactorExpires');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.twoFactorEnabled) return res.status(400).json({ success: false, message: '2FA is already enabled' });

        const otp = user.generateOTP();
        await user.save({ validateModifiedOnly: true });

        try { await sendOTPEmail(user.email, otp, '2fa_enable'); } catch (e) { console.error('[Email]', e.message); }

        res.json({ success: true, message: 'Verification code sent to your email', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
    } catch (error) { next(error); }
};

// ── Enable 2FA - Step 2: Verify OTP ──
exports.verify2FASetup = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Verification code is required' });

        const user = await User.findById(req.user.id).select('+twoFactorCode +twoFactorExpires +backupCodes');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.verifyOTP(code)) return res.status(400).json({ success: false, message: 'Invalid or expired code' });

        user.twoFactorEnabled = true;
        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        const backupCodes = user.generateBackupCodes();
        await user.save({ validateModifiedOnly: true });

        const info = getDeviceInfo(req);
        await SecurityAlert.create({
            user: user._id, type: 'two_factor_enabled',
            title: 'Two-Factor Authentication Enabled',
            message: 'Two-factor authentication has been enabled on your account.',
            ip: info.ip, device: `${info.browser} on ${info.os}`,
        });

        res.json({ success: true, message: '2FA enabled successfully', backupCodes });
    } catch (error) { next(error); }
};

// ── Disable 2FA ──
exports.disable2FA = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

        user.twoFactorEnabled = false;
        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        user.backupCodes = [];
        await user.save({ validateModifiedOnly: true });

        const info = getDeviceInfo(req);
        await SecurityAlert.create({
            user: user._id, type: 'two_factor_disabled',
            title: 'Two-Factor Authentication Disabled',
            message: 'Two-factor authentication has been disabled on your account.',
            ip: info.ip, device: `${info.browser} on ${info.os}`,
        });

        res.json({ success: true, message: '2FA disabled' });
    } catch (error) { next(error); }
};

// ── Regenerate Backup Codes ──
exports.regenerateBackupCodes = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

        const user = await User.findById(req.user.id).select('+password +backupCodes');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.twoFactorEnabled) return res.status(400).json({ success: false, message: '2FA is not enabled' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

        const backupCodes = user.generateBackupCodes();
        await user.save({ validateModifiedOnly: true });

        res.json({ success: true, backupCodes });
    } catch (error) { next(error); }
};

// ── Get Active Sessions ──
exports.getSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({ user: req.user.id, isActive: true }).sort({ lastActive: -1 });
        res.json({ success: true, sessions });
    } catch (error) { next(error); }
};

// ── Revoke Session ──
exports.revokeSession = async (req, res, next) => {
    try {
        const session = await Session.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isActive: false },
            { new: true }
        );
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        await SecurityAlert.create({
            user: req.user.id, type: 'session_revoked',
            title: 'Session Revoked',
            message: `A session on ${session.browser} (${session.os}) was revoked.`,
        });

        res.json({ success: true, message: 'Session revoked' });
    } catch (error) { next(error); }
};

// ── Revoke All Other Sessions ──
exports.revokeAllSessions = async (req, res, next) => {
    try {
        const currentToken = req.headers.authorization?.split(' ')[1];
        const currentHash = currentToken ? Session.hashToken(currentToken) : null;

        const query = { user: req.user.id, isActive: true };
        if (currentHash) query.tokenHash = { $ne: currentHash };

        const result = await Session.updateMany(query, { isActive: false });

        await SecurityAlert.create({
            user: req.user.id, type: 'session_revoked',
            title: 'All Other Sessions Revoked',
            message: `${result.modifiedCount} session(s) were revoked.`,
        });

        res.json({ success: true, message: `${result.modifiedCount} session(s) revoked` });
    } catch (error) { next(error); }
};

// ── Get Login History ──
exports.getLoginHistory = async (req, res, next) => {
    try {
        const history = await LoginHistory.find({ user: req.user.id })
            .sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, history });
    } catch (error) { next(error); }
};

// ── Get Security Alerts ──
exports.getSecurityAlerts = async (req, res, next) => {
    try {
        const alerts = await SecurityAlert.find({ user: req.user.id })
            .sort({ createdAt: -1 }).limit(50);
        const unreadCount = await SecurityAlert.countDocuments({ user: req.user.id, read: false });
        res.json({ success: true, alerts, unreadCount });
    } catch (error) { next(error); }
};

// ── Mark All Alerts Read ──
exports.markAlertsRead = async (req, res, next) => {
    try {
        await SecurityAlert.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) { next(error); }
};

// ── Forgot Password (public) ──
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } }).select('+resetPasswordCode +resetPasswordExpires');
        // Always return success to prevent email enumeration
        if (!user) return res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent' });

        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordCode = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
        await user.save({ validateModifiedOnly: true });

        try { await sendOTPEmail(user.email, otp, 'password_reset'); } catch (e) { console.error('[Email]', e.message); }

        res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
    } catch (error) { next(error); }
};

// ── Reset Password (public) ──
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

        const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordCode +resetPasswordExpires');
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });

        const hash = crypto.createHash('sha256').update(code).digest('hex');
        if (user.resetPasswordCode !== hash || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        user.password = newPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        user.passwordChangedAt = new Date();
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const info = getDeviceInfo(req);
        await SecurityAlert.create({
            user: user._id, type: 'password_change',
            title: 'Password Reset',
            message: 'Your password was reset using the forgot password flow.',
            ip: info.ip,
        });

        try { await sendAlertEmail(user.email, 'Password Was Reset', 'Your Arizonalex password was reset. If you didn\'t do this, contact support immediately.'); } catch (e) { console.error('[Email]', e.message); }

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) { next(error); }
};

// ── Delete Account ──
exports.deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

        // Soft delete
        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save({ validateModifiedOnly: true });

        // Invalidate all sessions
        await Session.updateMany({ user: user._id }, { isActive: false });

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) { next(error); }
};

// ── Get Security Overview (for settings page) ──
exports.getSecurityOverview = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const activeSessions = await Session.countDocuments({ user: req.user.id, isActive: true });
        const unreadAlerts = await SecurityAlert.countDocuments({ user: req.user.id, read: false });
        const recentLogins = await LoginHistory.countDocuments({ user: req.user.id });
        const lastLogin = await LoginHistory.findOne({ user: req.user.id, success: true }).sort({ createdAt: -1 });

        res.json({
            success: true,
            security: {
                twoFactorEnabled: user.twoFactorEnabled,
                passwordChangedAt: user.passwordChangedAt,
                email: user.email,
                authProvider: user.authProvider,
                activeSessions,
                unreadAlerts,
                recentLogins,
                lastLogin: lastLogin ? { ip: lastLogin.ip, device: lastLogin.device, browser: lastLogin.browser, os: lastLogin.os, location: lastLogin.location, time: lastLogin.createdAt } : null,
            },
        });
    } catch (error) { next(error); }
};
