const Wallet = require('../models/Wallet');

// Helper: get or create wallet
async function getOrCreateWallet(userId) {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = await Wallet.create({ user: userId });
    }
    return wallet;
}

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user._id);

        res.json({
            success: true,
            data: {
                balance: wallet.balance,
                escrowBalance: wallet.escrowBalance,
                totalEarned: wallet.totalEarned,
                totalSpent: wallet.totalSpent,
                totalDebates: wallet.totalDebates,
                totalWins: wallet.totalWins,
                winRate: wallet.winRate,
                twoFactorWithdraw: wallet.twoFactorWithdraw,
                recentTransactions: wallet.transactions.slice(-20).reverse(),
            },
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wallet' });
    }
};

// @desc    Deposit credits
// @route   POST /api/wallet/deposit
// @access  Private
exports.deposit = async (req, res) => {
    try {
        const { amount } = req.body;
        const depositAmount = Number(amount);

        if (!depositAmount || depositAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
        }

        if (depositAmount > 100000) {
            return res.status(400).json({ success: false, message: 'Maximum deposit is 100,000 credits' });
        }

        const wallet = await getOrCreateWallet(req.user._id);
        await wallet.deposit(depositAmount);

        // Broadcast balance update
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user._id}`).emit('wallet:update', {
                balance: wallet.balance,
                escrowBalance: wallet.escrowBalance,
            });
        }

        res.json({
            success: true,
            data: {
                balance: wallet.balance,
                message: `Successfully deposited ${depositAmount} credits`,
            },
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ success: false, message: 'Deposit failed' });
    }
};

// @desc    Withdraw credits
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdraw = async (req, res) => {
    try {
        const { amount } = req.body;
        const withdrawAmount = Number(amount);

        if (!withdrawAmount || withdrawAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
        }

        const wallet = await getOrCreateWallet(req.user._id);

        if (wallet.balance < withdrawAmount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: ${wallet.balance} credits`,
            });
        }

        // TODO: Add 2FA verification when twoFactorWithdraw is enabled
        // For now, process directly

        wallet.balance -= withdrawAmount;
        wallet.addTransaction('withdraw', withdrawAmount, `Withdrew ${withdrawAmount} credits`);
        wallet.lastWithdrawAt = new Date();
        await wallet.save();

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user._id}`).emit('wallet:update', {
                balance: wallet.balance,
                escrowBalance: wallet.escrowBalance,
            });
        }

        res.json({
            success: true,
            data: {
                balance: wallet.balance,
                message: `Successfully withdrew ${withdrawAmount} credits`,
            },
        });
    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ success: false, message: 'Withdrawal failed' });
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 50, type } = req.query;

        const wallet = await getOrCreateWallet(req.user._id);

        let transactions = wallet.transactions;

        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }

        // Sort by most recent first
        transactions = transactions.sort((a, b) => b.timestamp - a.timestamp);

        const start = (parseInt(page) - 1) * parseInt(limit);
        const paginated = transactions.slice(start, start + parseInt(limit));

        res.json({
            success: true,
            data: paginated,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: transactions.length,
                pages: Math.ceil(transactions.length / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
};

// @desc    Toggle 2FA for withdrawals
// @route   POST /api/wallet/toggle-2fa
// @access  Private
exports.toggle2FA = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user._id);
        wallet.twoFactorWithdraw = !wallet.twoFactorWithdraw;
        await wallet.save();

        res.json({
            success: true,
            data: { twoFactorWithdraw: wallet.twoFactorWithdraw },
        });
    } catch (error) {
        console.error('Toggle 2FA error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle 2FA' });
    }
};
