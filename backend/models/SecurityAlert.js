const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['new_login', 'password_change', 'email_change', 'two_factor_enabled', 'two_factor_disabled', 'suspicious_activity', 'account_locked', 'session_revoked'],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    ip: { type: String, default: '' },
    device: { type: String, default: '' },
    read: { type: Boolean, default: false },
}, { timestamps: true });

// TTL: auto-delete alerts older than 180 days
securityAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);
