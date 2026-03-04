const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalNotifications = await Notification.countDocuments();

        // Activity in last 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
        const postsToday = await Post.countDocuments({ createdAt: { $gte: oneDayAgo } });

        // Users by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);

        // Verification requests
        const pendingVerifications = await User.countDocuments({ verified: false, role: { $in: ['politician', 'journalist', 'official'] } });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalPosts,
                totalNotifications,
                newUsersToday,
                postsToday,
                pendingVerifications,
                usersByRole,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/admin/users
exports.getAdminUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);
        res.json({ success: true, count: users.length, total, users });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin users' });

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/admin/users/:id/verify
exports.verifyUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await Notification.create({
            recipient: user._id,
            type: 'verification',
            content: 'Your account has been verified! ✅',
        });

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};
