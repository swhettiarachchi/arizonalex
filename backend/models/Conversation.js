const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['dm', 'group'], default: 'dm' },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
        
        // Group-specific fields
        name: { type: String, default: '' },
        avatar: { type: String, default: '' },
        description: { type: String, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        
        // Messaging state
        lastMessage: { type: String, default: '' },
        lastMessageAt: { type: Date, default: Date.now },
        lastMessageBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        unreadCounts: { type: Map, of: Number, default: {} },
        
        // Per-user settings (stored as arrays of user IDs)
        pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        
        // Pinned messages
        pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ type: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
