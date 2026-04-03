const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const SecurityAlert = require('../models/SecurityAlert');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const { sendOTPEmail } = require('../utils/email');
const crypto = require('crypto');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Helper: create session + login history + alert
async function recordLogin(user, token, req, success, failReason = '') {
    const info = getDeviceInfo(req);

    // Login history
    await LoginHistory.create({
        user: user._id, ip: info.ip, device: info.device,
        browser: info.browser, os: info.os, location: info.location,
        success, failReason,
    });

    if (success && token) {
        // Create session
        await Session.create({
            user: user._id, tokenHash: Session.hashToken(token),
            device: info.device, browser: info.browser, os: info.os,
            ip: info.ip, location: info.location,
        });

        // Security alert for new login
        await SecurityAlert.create({
            user: user._id, type: 'new_login',
            title: 'New Login Detected',
            message: `New sign-in from ${info.browser} on ${info.os} (${info.ip})`,
            ip: info.ip, device: `${info.browser} on ${info.os}`,
        });
    }
}

// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, username, password, bio, role } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({ success: false, message: `User with that ${field} already exists` });
        }

        const user = await User.create({ name, email, username, password, bio, role });
        const token = user.getSignedJwtToken();

        await recordLogin(user, token, req, true);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id, name: user.name, email: user.email,
                username: user.username, avatar: user.avatar, bio: user.bio,
                role: user.role, verified: user.verified,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } }).select('+password +twoFactorCode +twoFactorExpires +loginAttempts +lockUntil');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked) {
            const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            await recordLogin(user, null, req, false, 'Account locked');
            return res.status(423).json({ success: false, message: `Account temporarily locked. Try again in ${remaining} minute(s).` });
        }

        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({ success: false, message: 'This account uses Google Sign-In. Please log in with Google.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            await user.incLoginAttempts();
            await recordLogin(user, null, req, false, 'Invalid password');
            const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
            return res.status(401).json({ success: false, message: attemptsLeft > 0 ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining.` : 'Account locked for 15 minutes due to too many failed attempts.' });
        }

        // Reset login attempts on success
        await user.resetLoginAttempts();

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            const otp = user.generateOTP();
            await user.save({ validateModifiedOnly: true });
            try { await sendOTPEmail(user.email, otp, '2fa_login'); } catch (e) { console.error('[Email]', e.message); }

            return res.json({
                success: true,
                requires2FA: true,
                tempToken: Buffer.from(JSON.stringify({ userId: user._id, expires: Date.now() + 5 * 60 * 1000 })).toString('base64'),
                message: 'Verification code sent to your email',
                devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
            });
        }

        const token = user.getSignedJwtToken();
        await recordLogin(user, token, req, true);

        res.json({
            success: true,
            token,
            user: {
                id: user._id, name: user.name, email: user.email,
                username: user.username, avatar: user.avatar, bio: user.bio,
                role: user.role, verified: user.verified, party: user.party,
                followersCount: user.followersCount, followingCount: user.followingCount,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/verify-2fa
exports.verify2FA = async (req, res, next) => {
    try {
        const { tempToken, code } = req.body;
        if (!tempToken || !code) return res.status(400).json({ success: false, message: 'Temp token and code are required' });

        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(tempToken, 'base64').toString());
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        if (decoded.expires < Date.now()) return res.status(400).json({ success: false, message: 'Token expired. Please login again.' });

        const user = await User.findById(decoded.userId).select('+twoFactorCode +twoFactorExpires +backupCodes');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Try OTP first, then backup code
        let valid = user.verifyOTP(code);
        if (!valid) {
            valid = user.verifyBackupCode(code);
            if (valid) await user.save({ validateModifiedOnly: true });
        }

        if (!valid) return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });

        // Clear OTP
        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        await user.save({ validateModifiedOnly: true });

        const token = user.getSignedJwtToken();
        await recordLogin(user, token, req, true);

        res.json({
            success: true,
            token,
            user: {
                id: user._id, name: user.name, email: user.email,
                username: user.username, avatar: user.avatar, bio: user.bio,
                role: user.role, verified: user.verified, party: user.party,
                followersCount: user.followersCount, followingCount: user.followingCount,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/google
exports.googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                if (!user.avatar && picture) user.avatar = picture;
                await user.save();
            } else {
                let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 25);
                let username = baseUsername;
                let counter = 1;
                while (await User.findOne({ username })) {
                    username = `${baseUsername.substring(0, 25)}${counter}`;
                    counter++;
                }
                user = await User.create({
                    name: name || email.split('@')[0], email, username, googleId,
                    authProvider: 'google', avatar: picture || '', role: 'citizen', verified: true,
                });
            }
        }

        const token = user.getSignedJwtToken();
        await recordLogin(user, token, req, true);

        res.json({
            success: true, token,
            user: {
                id: user._id, name: user.name, email: user.email,
                username: user.username, avatar: user.avatar, bio: user.bio,
                role: user.role, verified: user.verified, party: user.party,
                followersCount: user.followersCount, followingCount: user.followingCount,
            },
        });
    } catch (error) {
        if (error.message && error.message.includes('Token used too late')) {
            return res.status(401).json({ success: false, message: 'Google token expired. Please try again.' });
        }
        next(error);
    }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};
