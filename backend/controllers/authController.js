const User = require('../models/User');
const { validationResult } = require('express-validator');

// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, username, password, bio, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({ success: false, message: `User with that ${field} already exists` });
        }

        const user = await User.create({ name, email, username, password, bio, role });
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role,
                verified: user.verified,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = user.getSignedJwtToken();

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role,
                verified: user.verified,
                party: user.party,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};
