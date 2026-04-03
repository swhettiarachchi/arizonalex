const mongoose = require('mongoose');

const escrowParticipantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
    processedAt: { type: Date, default: null },
});

const escrowSchema = new mongoose.Schema(
    {
        debate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', required: true, unique: true },
        participants: [escrowParticipantSchema],
        totalAmount: { type: Number, default: 0, min: 0 },
        platformFeeAmount: { type: Number, default: 0, min: 0 },
        platformFeePercent: { type: Number, default: 10, min: 0, max: 100 },
        status: {
            type: String,
            enum: ['active', 'released', 'refunded', 'disputed', 'partial'],
            default: 'active',
        },
        releasedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        releasedAt: { type: Date, default: null },
        releasedAmount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: prize amount (total - platform fee)
escrowSchema.virtual('prizeAmount').get(function () {
    return this.totalAmount - this.platformFeeAmount;
});

// Method: add participant funds
escrowSchema.methods.addParticipant = function (userId, amount) {
    this.participants.push({ user: userId, amount, status: 'held' });
    this.totalAmount += amount;
    this.platformFeeAmount = Math.round((this.totalAmount * this.platformFeePercent) / 100 * 100) / 100;
};

// Method: release to winner
escrowSchema.methods.releaseToWinner = function (winnerId) {
    const prizeAmount = this.totalAmount - this.platformFeeAmount;
    this.releasedTo = winnerId;
    this.releasedAt = new Date();
    this.releasedAmount = prizeAmount;
    this.status = 'released';

    this.participants.forEach(p => {
        if (p.user.toString() === winnerId.toString()) {
            p.status = 'released';
        } else {
            p.status = 'released'; // Their share went to winner
        }
        p.processedAt = new Date();
    });

    return prizeAmount;
};

// Method: refund all
escrowSchema.methods.refundAll = function () {
    this.status = 'refunded';
    this.participants.forEach(p => {
        p.status = 'refunded';
        p.processedAt = new Date();
    });
};

// Method: handle draw (split evenly)
escrowSchema.methods.handleDraw = function () {
    this.status = 'released';
    const perPerson = Math.floor((this.totalAmount - this.platformFeeAmount) / this.participants.length);
    this.releasedAmount = perPerson * this.participants.length;
    this.participants.forEach(p => {
        p.status = 'released';
        p.processedAt = new Date();
    });
    return perPerson;
};

// Indexes
escrowSchema.index({ debate: 1 }, { unique: true });
escrowSchema.index({ status: 1 });

module.exports = mongoose.model('Escrow', escrowSchema);
