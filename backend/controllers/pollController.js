const Poll = require('../models/Poll');

// @route   GET /api/polls
exports.getPolls = async (req, res, next) => {
    try {
        const polls = await Poll.find().populate('author', 'name username avatar role verified').sort({ createdAt: -1 });
        res.json({ success: true, polls });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/polls
exports.createPoll = async (req, res, next) => {
    try {
        const { question, options, endDate } = req.body;
        const poll = await Poll.create({
            question,
            options: options.map((label) => ({ label, votes: [] })),
            endDate,
            author: req.user.id,
        });
        const populated = await poll.populate('author', 'name username avatar role verified');
        res.status(201).json({ success: true, poll: populated });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/polls/:id/vote
exports.votePoll = async (req, res, next) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

        if (new Date() > new Date(poll.endDate)) {
            return res.status(400).json({ success: false, message: 'Poll has ended' });
        }

        // Check if already voted
        const alreadyVoted = poll.options.some((opt) => opt.votes.includes(req.user.id));
        if (alreadyVoted) return res.status(400).json({ success: false, message: 'Already voted' });

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ success: false, message: 'Invalid option' });
        }

        poll.options[optionIndex].votes.push(req.user.id);
        await poll.save();

        res.json({ success: true, poll });
    } catch (error) {
        next(error);
    }
};
