const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper: serialize post for frontend consumption
function serializePost(post, userId) {
    const obj = post.toObject ? post.toObject() : post;
    return {
        id: obj._id || obj.id,
        author: obj.author,
        content: obj.content,
        type: obj.type,
        policyTitle: obj.policyTitle || '',
        policyCategory: obj.policyCategory || '',
        images: obj.images || [],
        video: obj.video || '',
        likes: obj.likes ? obj.likes.length : 0,
        comments: obj.commentsCount || 0,
        reposts: obj.reposts ? obj.reposts.length : 0,
        timestamp: formatTimestamp(obj.createdAt),
        hashtags: obj.hashtags || [],
        liked: userId ? (obj.likes || []).some(id => id.toString() === userId.toString()) : false,
        bookmarked: userId ? (obj.bookmarkedBy || []).some(id => id.toString() === userId.toString()) : false,
        reposted: userId ? (obj.reposts || []).some(id => id.toString() === userId.toString()) : false,
    };
}

function formatTimestamp(date) {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Roles for tab filtering
const POLITICAL_ROLES = ['politician', 'official'];
const BUSINESS_ROLES = ['businessman', 'entrepreneur', 'banker', 'stock_trader', 'crypto_trader'];
const MARKET_HASHTAGS = ['markets', 'stocks', 'crypto', 'finance', 'economy', 'bitcoin', 'trading'];

// @route   GET /api/posts
exports.getPosts = async (req, res, next) => {
    try {
        const { type, author, hashtag, tab, q, bookmarked, page = 1, limit = 20 } = req.query;
        const userId = req.user?._id;
        let query = {};

        // Bookmarked posts
        if (bookmarked === 'true' && userId) {
            query.bookmarkedBy = userId;
        }

        // Tab-based filtering
        if (tab && !bookmarked) {
            if (tab === 'politics') {
                const politicalUserIds = await User.find({ role: { $in: POLITICAL_ROLES } }).select('_id');
                query.author = { $in: politicalUserIds.map(u => u._id) };
            } else if (tab === 'business') {
                const businessUserIds = await User.find({ role: { $in: BUSINESS_ROLES } }).select('_id');
                query.author = { $in: businessUserIds.map(u => u._id) };
            } else if (tab === 'policy') {
                query.$or = [
                    { type: 'policy' },
                    { author: { $in: (await User.find({ role: { $in: POLITICAL_ROLES } }).select('_id')).map(u => u._id) } },
                ];
            } else if (tab === 'trending') {
                // Will sort by likes count below
            } else if (tab === 'markets') {
                query.hashtags = { $in: MARKET_HASHTAGS };
            }
        }

        // Direct filters
        if (type) query.type = type;
        if (author) query.author = author;
        if (hashtag) query.hashtags = hashtag;

        // Search
        if (q) {
            const searchQuery = q.toString();
            const searchFilter = [
                { content: { $regex: searchQuery, $options: 'i' } },
                { hashtags: { $regex: searchQuery, $options: 'i' } },
            ];
            if (query.$or) {
                query.$and = [{ $or: query.$or }, { $or: searchFilter }];
                delete query.$or;
            } else {
                query.$or = searchFilter;
            }
        }

        let sortOption = { createdAt: -1 };

        const posts = await Post.find(query)
            .populate('author', 'name username avatar role verified party bio followers following')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort(sortOption);

        const total = await Post.countDocuments(query);

        // Serialize posts for frontend
        const serialized = posts.map(p => serializePost(p, userId));

        res.json({ success: true, count: serialized.length, total, page: Number(page), posts: serialized });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/posts/feed/timeline
exports.getTimeline = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const user = req.user;

        // Get posts from followed users + own posts
        const followingIds = [...user.following, user._id];

        const posts = await Post.find({ author: { $in: followingIds } })
            .populate('author', 'name username avatar role verified party bio followers following')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ author: { $in: followingIds } });

        const serialized = posts.map(p => serializePost(p, user._id));
        res.json({ success: true, count: serialized.length, total, page: Number(page), posts: serialized });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/posts/:id
exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name username avatar role verified party bio followers following');

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const userId = req.user?._id;
        res.json({ success: true, post: serializePost(post, userId) });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/posts
exports.createPost = async (req, res, next) => {
    try {
        const { content, type, images, video, policyTitle, policyCategory } = req.body;

        const post = await Post.create({
            author: req.user.id,
            content,
            type: type || 'text',
            images: images || [],
            video: video || '',
            policyTitle: type === 'policy' ? (policyTitle || 'Untitled Policy Proposal') : '',
            policyCategory: type === 'policy' ? (policyCategory || 'General') : '',
        });

        const populated = await post.populate('author', 'name username avatar role verified party bio followers following');

        // Emit real-time event
        const io = req.app.get('io');
        if (io) {
            io.emit('post:created', serializePost(populated, req.user.id));
        }

        res.status(201).json({ success: true, post: serializePost(populated, req.user.id) });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/posts/:id
exports.updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { content, type, images, video, policyTitle, policyCategory } = req.body;
        const updates = {};
        if (content !== undefined) updates.content = content;
        if (type !== undefined) updates.type = type;
        if (images !== undefined) updates.images = images;
        if (video !== undefined) updates.video = video;
        if (policyTitle !== undefined) updates.policyTitle = policyTitle;
        if (policyCategory !== undefined) updates.policyCategory = policyCategory;

        post = await Post.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'name username avatar role verified party bio followers following');

        res.json({ success: true, post: serializePost(post, req.user.id) });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await post.deleteOne();
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/posts/:id/like
exports.likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const isLiked = post.likes.includes(req.user.id);

        if (isLiked) {
            await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user.id } });
        } else {
            await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.id } });

            // Notify post author (don't notify yourself)
            if (post.author.toString() !== req.user.id) {
                await Notification.create({
                    recipient: post.author,
                    type: 'like',
                    actor: req.user.id,
                    content: 'liked your post',
                    relatedPost: post._id,
                });

                // Real-time notification
                const io = req.app.get('io');
                if (io) {
                    io.to(`user:${post.author}`).emit('notification:new', {
                        type: 'like',
                        actor: { _id: req.user._id, name: req.user.name, username: req.user.username, avatar: req.user.avatar },
                        content: 'liked your post',
                    });
                }
            }
        }

        const updated = await Post.findById(req.params.id);
        res.json({
            success: true,
            liked: !isLiked,
            likes: updated.likes.length,
            message: isLiked ? 'Post unliked' : 'Post liked',
        });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/posts/:id/repost
exports.repost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const isReposted = post.reposts.includes(req.user.id);

        if (isReposted) {
            await Post.findByIdAndUpdate(req.params.id, { $pull: { reposts: req.user.id } });
        } else {
            await Post.findByIdAndUpdate(req.params.id, { $addToSet: { reposts: req.user.id } });

            if (post.author.toString() !== req.user.id) {
                await Notification.create({
                    recipient: post.author,
                    type: 'repost',
                    actor: req.user.id,
                    content: 'reposted your post',
                    relatedPost: post._id,
                });
            }
        }

        const updated = await Post.findById(req.params.id);
        res.json({
            success: true,
            reposted: !isReposted,
            reposts: updated.reposts.length,
            message: isReposted ? 'Repost removed' : 'Post reposted',
        });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/posts/:id/bookmark
exports.bookmarkPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const isBookmarked = post.bookmarkedBy.includes(req.user.id);

        if (isBookmarked) {
            await Post.findByIdAndUpdate(req.params.id, { $pull: { bookmarkedBy: req.user.id } });
        } else {
            await Post.findByIdAndUpdate(req.params.id, { $addToSet: { bookmarkedBy: req.user.id } });
        }

        res.json({
            success: true,
            bookmarked: !isBookmarked,
            message: isBookmarked ? 'Bookmark removed' : 'Post bookmarked',
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/posts/bookmarks/me
exports.getBookmarks = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const posts = await Post.find({ bookmarkedBy: req.user.id })
            .populate('author', 'name username avatar role verified party bio followers following')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ bookmarkedBy: req.user.id });
        const serialized = posts.map(p => serializePost(p, req.user.id));

        res.json({ success: true, count: serialized.length, total, page: Number(page), posts: serialized });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/posts/user/:username
exports.getPostsByUsername = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { page = 1, limit = 20 } = req.query;
        const posts = await Post.find({ author: user._id })
            .populate('author', 'name username avatar role verified party bio followers following')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ author: user._id });
        const userId = req.user?._id;
        const serialized = posts.map(p => serializePost(p, userId));

        res.json({ success: true, count: serialized.length, total, page: Number(page), posts: serialized });
    } catch (error) {
        next(error);
    }
};
