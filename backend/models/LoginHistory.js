const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ip: { type: String, default: '' },
    device: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    location: { type: String, default: 'Unknown' },
    success: { type: Boolean, required: true },
    failReason: { type: String, default: '' },
}, { timestamps: true });

// TTL: auto-delete entries older than 90 days
loginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
