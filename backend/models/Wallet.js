const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'entry_fee', 'earning', 'refund', 'escrow_hold', 'escrow_release', 'platform_fee', 'bonus'],
        required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    relatedDebate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', default: null },
    balanceAfter: { type: Number, default: 0 },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    timestamp: { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        balance: { type: Number, default: 100, min: 0 }, // Start with 100 credits
        escrowBalance: { type: Number, default: 0, min: 0 },
        totalEarned: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        totalDebates: { type: Number, default: 0 },
        totalWins: { type: Number, default: 0 },
        transactions: [transactionSchema],
        twoFactorWithdraw: { type: Boolean, default: false },
        lastDepositAt: { type: Date },
        lastWithdrawAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: win rate
walletSchema.virtual('winRate').get(function () {
    if (this.totalDebates === 0) return 0;
    return Math.round((this.totalWins / this.totalDebates) * 100);
});

// Method: add transaction
walletSchema.methods.addTransaction = function (type, amount, description, debateId = null) {
    const balanceAfter = type === 'withdraw' || type === 'entry_fee' || type === 'escrow_hold' || type === 'platform_fee'
        ? this.balance - Math.abs(amount)
        : this.balance + Math.abs(amount);

    this.transactions.push({
        type,
        amount: Math.abs(amount),
        description,
        relatedDebate: debateId,
        balanceAfter,
    });

    // Keep last 500 transactions
    if (this.transactions.length > 500) {
        this.transactions = this.transactions.slice(-500);
    }
};

// Method: deposit credits
walletSchema.methods.deposit = async function (amount) {
    if (amount <= 0) throw new Error('Deposit amount must be positive');
    this.balance += amount;
    this.addTransaction('deposit', amount, `Deposited ${amount} credits`);
    this.lastDepositAt = new Date();
    return this.save();
};

// Method: hold entry fee in escrow
walletSchema.methods.holdEscrow = async function (amount, debateId) {
    if (this.balance < amount) throw new Error('Insufficient balance');
    this.balance -= amount;
    this.escrowBalance += amount;
    this.totalSpent += amount;
    this.addTransaction('escrow_hold', amount, `Entry fee held for debate`, debateId);
    return this.save();
};

// Method: release escrow to winner
walletSchema.methods.releaseEscrowWinnings = async function (amount, debateId) {
    this.balance += amount;
    this.totalEarned += amount;
    this.totalWins += 1;
    this.addTransaction('earning', amount, `Won debate — prize received`, debateId);
    return this.save();
};

// Method: refund escrow
walletSchema.methods.refundEscrow = async function (amount, debateId) {
    this.escrowBalance = Math.max(0, this.escrowBalance - amount);
    this.balance += amount;
    this.totalSpent = Math.max(0, this.totalSpent - amount);
    this.addTransaction('refund', amount, `Debate cancelled — entry fee refunded`, debateId);
    return this.save();
};

// Indexes
walletSchema.index({ user: 1 }, { unique: true });
walletSchema.index({ balance: -1 });

module.exports = mongoose.model('Wallet', walletSchema);
