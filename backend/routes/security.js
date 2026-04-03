const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { sensitiveActionLimiter, otpLimiter } = require('../middleware/rateLimiter');
const {
    changePassword,
    requestEmailChange,
    verifyEmailChange,
    enable2FA,
    verify2FASetup,
    disable2FA,
    regenerateBackupCodes,
    getSessions,
    revokeSession,
    revokeAllSessions,
    getLoginHistory,
    getSecurityAlerts,
    markAlertsRead,
    forgotPassword,
    resetPassword,
    deleteAccount,
    getSecurityOverview,
} = require('../controllers/securityController');

// Public routes (no auth required)
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', sensitiveActionLimiter, resetPassword);

// Protected routes (auth required)
router.use(protect);

// Overview
router.get('/overview', getSecurityOverview);

// Password
router.post('/change-password', sensitiveActionLimiter, changePassword);

// Email
router.post('/change-email/request', sensitiveActionLimiter, requestEmailChange);
router.post('/change-email/verify', verifyEmailChange);

// 2FA
router.post('/2fa/enable', otpLimiter, enable2FA);
router.post('/2fa/verify', verify2FASetup);
router.post('/2fa/disable', sensitiveActionLimiter, disable2FA);
router.post('/2fa/backup-codes', sensitiveActionLimiter, regenerateBackupCodes);

// Sessions
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.delete('/sessions/all', revokeAllSessions);

// Login History
router.get('/login-history', getLoginHistory);

// Security Alerts
router.get('/alerts', getSecurityAlerts);
router.post('/alerts/read-all', markAlertsRead);

// Delete Account
router.post('/delete-account', sensitiveActionLimiter, deleteAccount);

module.exports = router;
