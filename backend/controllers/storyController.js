const Story = require('../models/Story');

// @route   GET /api/stories
exports.getStories = async (req, res, next) => {
    try {
        const stories = await Story.find({ expiresAt: { $gt: new Date() } })
            .populate('author', 'name username avatar role verified')
            .sort({ createdAt: -1 });

        // Group by author
        const grouped = {};
        stories.forEach((story) => {
            const authorId = story.author._id.toString();
            if (!grouped[authorId]) {
                grouped[authorId] = { author: story.author, stories: [] };
            }
            grouped[authorId].stories.push(story);
        });

        res.json({ success: true, storyGroups: Object.values(grouped) });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/stories
exports.createStory = async (req, res, next) => {
    try {
        const story = await Story.create({
            author: req.user.id,
            image: req.body.image,
        });
        const populated = await story.populate('author', 'name username avatar role verified');
        res.status(201).json({ success: true, story: populated });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/stories/:id/view
exports.viewStory = async (req, res, next) => {
    try {
        await Story.findByIdAndUpdate(req.params.id, { $addToSet: { viewedBy: req.user.id } });
        res.json({ success: true, message: 'Story marked as viewed' });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/stories/:id
exports.deleteStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        if (story.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await story.deleteOne();
        res.json({ success: true, message: 'Story deleted' });
    } catch (error) {
        next(error);
    }
};
