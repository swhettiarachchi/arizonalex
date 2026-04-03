const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        
        // Content
        type: { type: String, enum: ['text', 'image', 'video', 'file', 'voice', 'system'], default: 'text' },
        content: { type: String, default: '' },
        
        // Media
        mediaUrl: { type: String, default: '' },
        mediaMimeType: { type: String, default: '' },
        mediaSize: { type: Number, default: 0 },
        voiceDuration: { type: Number, default: 0 }, // seconds
        fileName: { type: String, default: '' },
        
        // Status
        status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
        deliveredAt: { type: Date },
        seenAt: { type: Date },
        seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        
        // Threading & interactions
        replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        reactions: [{
            emoji: { type: String, required: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now },
        }],
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        
        // Moderation
        pinned: { type: Boolean, default: false },
        deleted: { type: Boolean, default: false },
        edited: { type: Boolean, default: false },
        editedAt: { type: Date },
        
        // Legacy compatibility
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, pinned: 1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
