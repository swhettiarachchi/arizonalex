const mongoose = require('mongoose');

const debateMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    timestamp: { type: Date, default: Date.now },
});

const debateSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Debate title is required'], trim: true, maxlength: 200 },
        description: { type: String, default: '', maxlength: 1000 },
        topic: { type: String, required: [true, 'Debate topic is required'], trim: true, maxlength: 300 },
        category: {
            type: String,
            enum: ['politics', 'crypto', 'business', 'tech', 'social', 'science', 'sports', 'other'],
            default: 'other',
        },
        mode: { type: String, enum: ['text', 'voice', 'video'], default: 'text' },
        status: {
            type: String,
            enum: ['waiting', 'live', 'voting', 'completed', 'cancelled'],
            default: 'waiting',
        },

        // Participants
        creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

        // Financials
        entryFee: { type: Number, default: 10, min: 0, max: 10000 },
        prizePool: { type: Number, default: 0 },
        platformFee: { type: Number, default: 10 }, // percentage — 10% platform commission
        escrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Escrow', default: null },

        // Timing
        duration: { type: Number, default: 5, min: 1, max: 120 }, // minutes
        votingDuration: { type: Number, default: 60, min: 1, max: 1440 }, // minutes (1hr default)
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null },
        votingDeadline: { type: Date, default: null },

        // Chat log
        messages: [debateMessageSchema],

        // Spectators
        maxSpectators: { type: Number, default: 1000 },
        spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        // Results
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        isDraw: { type: Boolean, default: false },

        // Tags & difficulty
        tags: [{ type: String, trim: true }],
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'pro'],
            default: 'beginner',
        },

        // Country & location
        country: { type: String, default: 'Global', trim: true, index: true },
        countries: [{ type: String, trim: true }], // multi-country debates
        language: { type: String, default: 'English', trim: true },
        debateType: { type: String, enum: ['1v1', 'group', 'live'], default: '1v1' },
        isGlobal: { type: Boolean, default: false },

        // Metadata
        viewCount: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: vote counts (computed from Vote collection)
debateSchema.virtual('votes', {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'debate',
});

// Virtual: spectator count
debateSchema.virtual('spectatorCount').get(function () {
    return this.spectators ? this.spectators.length : 0;
});

// Virtual: is voting open
debateSchema.virtual('isVotingOpen').get(function () {
    if (this.status !== 'voting') return false;
    if (!this.votingDeadline) return false;
    return new Date() < this.votingDeadline;
});

// Virtual: time remaining (seconds)
debateSchema.virtual('timeRemaining').get(function () {
    if (this.status === 'live' && this.startedAt) {
        const endTime = new Date(this.startedAt.getTime() + this.duration * 60000);
        const remaining = Math.max(0, (endTime - Date.now()) / 1000);
        return Math.round(remaining);
    }
    if (this.status === 'voting' && this.votingDeadline) {
        const remaining = Math.max(0, (this.votingDeadline - Date.now()) / 1000);
        return Math.round(remaining);
    }
    return 0;
});

// Indexes
debateSchema.index({ status: 1, category: 1 });
debateSchema.index({ creator: 1 });
debateSchema.index({ opponent: 1 });
debateSchema.index({ createdAt: -1 });
debateSchema.index({ featured: 1, status: 1 });
debateSchema.index({ country: 1, status: 1, category: 1 });
debateSchema.index({ isGlobal: 1, status: 1 });

module.exports = mongoose.model('Debate', debateSchema);
