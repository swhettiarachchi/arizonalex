const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['like', 'comment', 'follow', 'mention', 'repost', 'system', 'verification'], required: true },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        read: { type: Boolean, default: false },
        relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
