const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
    {
        debate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', required: true },
        voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        votedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        locked: { type: Boolean, default: true }, // Votes are locked after submission
        ip: { type: String, default: '' },

        // Anti-fraud
        flagged: { type: Boolean, default: false },
        flagReason: { type: String, default: '' },
        userAgent: { type: String, default: '' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound unique index: one vote per user per debate
voteSchema.index({ debate: 1, voter: 1 }, { unique: true });
voteSchema.index({ debate: 1, votedFor: 1 });
voteSchema.index({ flagged: 1 });

// Static: get vote counts for a debate
voteSchema.statics.getDebateVotes = async function (debateId) {
    const results = await this.aggregate([
        { $match: { debate: new mongoose.Types.ObjectId(debateId), flagged: false } },
        { $group: { _id: '$votedFor', count: { $sum: 1 } } },
    ]);

    const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
    const voteCounts = {};
    results.forEach(r => {
        voteCounts[r._id.toString()] = r.count;
    });

    return { voteCounts, totalVotes };
};

// Static: check if user has voted
voteSchema.statics.hasVoted = async function (debateId, userId) {
    const vote = await this.findOne({ debate: debateId, voter: userId });
    return vote ? { voted: true, votedFor: vote.votedFor } : { voted: false };
};

// Static: detect suspicious voting patterns
voteSchema.statics.detectFraud = async function (debateId) {
    // Check for rapid voting from same IP
    const ipCounts = await this.aggregate([
        { $match: { debate: new mongoose.Types.ObjectId(debateId) } },
        { $group: { _id: '$ip', count: { $sum: 1 } } },
        { $match: { count: { $gt: 3 } } },
    ]);

    if (ipCounts.length > 0) {
        // Flag votes from suspicious IPs
        const suspiciousIps = ipCounts.map(r => r._id);
        await this.updateMany(
            { debate: debateId, ip: { $in: suspiciousIps } },
            { $set: { flagged: true, flagReason: 'Multiple votes from same IP' } }
        );
        return { suspicious: true, flaggedIps: suspiciousIps.length };
    }

    return { suspicious: false, flaggedIps: 0 };
};

module.exports = mongoose.model('Vote', voteSchema);
