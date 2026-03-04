const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @route   GET /api/comments/post/:postId
exports.getComments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'name username avatar role verified')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Comment.countDocuments({ post: req.params.postId });
        res.json({ success: true, count: comments.length, total, comments });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/comments/post/:postId
exports.createComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = await Comment.create({
            post: req.params.postId,
            author: req.user.id,
            content: req.body.content,
        });

        // Increment comments count on post
        await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

        // Notify post author
        if (post.author.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.author,
                type: 'comment',
                actor: req.user.id,
                content: 'commented on your post',
                relatedPost: post._id,
            });
        }

        const populated = await comment.populate('author', 'name username avatar role verified');
        res.status(201).json({ success: true, comment: populated });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
        await comment.deleteOne();

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        next(error);
    }
};
