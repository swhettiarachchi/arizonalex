const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/explore/trending
exports.getTrending = async (req, res, next) => {
    try {
        // Aggregate hashtags from recent posts (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const trendingHashtags = await Post.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, hashtags: { $exists: true, $ne: [] } } },
            { $unwind: '$hashtags' },
            { $group: { _id: '$hashtags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { tag: '$_id', posts: '$count', _id: 0 } },
        ]);

        // Trending posts (most liked in last 7 days)
        const trendingPosts = await Post.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $addFields: { likesCount: { $size: '$likes' } } },
            { $sort: { likesCount: -1 } },
            { $limit: 10 },
        ]);

        // Populate the trending posts
        const populatedPosts = await Post.populate(trendingPosts, {
            path: 'author',
            select: 'name username avatar role verified party',
        });

        // Suggested users (most followed, not already followed by current user)
        const suggestedUsers = await User.find({ verified: true })
            .select('name username avatar bio role verified party followers')
            .sort({ followers: -1 })
            .limit(5);

        res.json({
            success: true,
            trending: {
                hashtags: trendingHashtags,
                posts: populatedPosts,
                suggestedUsers,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/explore/search
exports.search = async (req, res, next) => {
    try {
        const { q, type = 'all' } = req.query;

        if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });

        const results = {};

        if (type === 'all' || type === 'users') {
            results.users = await User.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { username: { $regex: q, $options: 'i' } },
                    { bio: { $regex: q, $options: 'i' } },
                ],
            })
                .select('name username avatar bio role verified party')
                .limit(10);
        }

        if (type === 'all' || type === 'posts') {
            results.posts = await Post.find({
                $or: [
                    { content: { $regex: q, $options: 'i' } },
                    { hashtags: { $regex: q, $options: 'i' } },
                ],
            })
                .populate('author', 'name username avatar role verified')
                .limit(20)
                .sort({ createdAt: -1 });
        }

        res.json({ success: true, query: q, results });
    } catch (error) {
        next(error);
    }
};
