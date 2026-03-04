const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({ success: true, count: users.length, total, page: Number(page), users });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/users/:id
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/users/username/:username
exports.getUserByUsername = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const { name, bio, avatar, banner, location, website, party } = req.body;

        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, bio, avatar, banner, location, website, party },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/users/:id/follow
exports.followUser = async (req, res, next) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(req.params.id);
        if (!userToFollow) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if already following
        if (userToFollow.followers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already following this user' });
        }

        // Add to followers/following
        await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } });
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } });

        // Create notification
        await Notification.create({
            recipient: req.params.id,
            type: 'follow',
            actor: req.user.id,
            content: 'started following you',
        });

        res.json({ success: true, message: 'User followed successfully' });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/users/:id/unfollow
exports.unfollowUser = async (req, res, next) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ success: false, message: 'You cannot unfollow yourself' });
        }

        await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
        await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });

        res.json({ success: true, message: 'User unfollowed successfully' });
    } catch (error) {
        next(error);
    }
};
