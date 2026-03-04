const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @route   GET /api/posts
exports.getPosts = async (req, res, next) => {
    try {
        const { type, author, hashtag, page = 1, limit = 20 } = req.query;
        const query = {};

        if (type) query.type = type;
        if (author) query.author = author;
        if (hashtag) query.hashtags = hashtag;

        const posts = await Post.find(query)
            .populate('author', 'name username avatar role verified party')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments(query);

        res.json({ success: true, count: posts.length, total, page: Number(page), posts });
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
            .populate('author', 'name username avatar role verified party')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ author: { $in: followingIds } });

        res.json({ success: true, count: posts.length, total, page: Number(page), posts });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/posts/:id
exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name username avatar role verified party');

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/posts
exports.createPost = async (req, res, next) => {
    try {
        const { content, type, images, video } = req.body;

        const post = await Post.create({
            author: req.user.id,
            content,
            type: type || 'text',
            images: images || [],
            video: video || '',
        });

        const populated = await post.populate('author', 'name username avatar role verified party');

        res.status(201).json({ success: true, post: populated });
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

        const { content, type, images, video } = req.body;
        post = await Post.findByIdAndUpdate(
            req.params.id,
            { content, type, images, video },
            { new: true, runValidators: true }
        ).populate('author', 'name username avatar role verified party');

        res.json({ success: true, post });
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
            res.json({ success: true, liked: false, message: 'Post unliked' });
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
            }

            res.json({ success: true, liked: true, message: 'Post liked' });
        }
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
            res.json({ success: true, reposted: false, message: 'Repost removed' });
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

            res.json({ success: true, reposted: true, message: 'Post reposted' });
        }
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
            res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
        } else {
            await Post.findByIdAndUpdate(req.params.id, { $addToSet: { bookmarkedBy: req.user.id } });
            res.json({ success: true, bookmarked: true, message: 'Post bookmarked' });
        }
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/posts/bookmarks/me
exports.getBookmarks = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const posts = await Post.find({ bookmarkedBy: req.user.id })
            .populate('author', 'name username avatar role verified party')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ bookmarkedBy: req.user.id });

        res.json({ success: true, count: posts.length, total, page: Number(page), posts });
    } catch (error) {
        next(error);
    }
};
