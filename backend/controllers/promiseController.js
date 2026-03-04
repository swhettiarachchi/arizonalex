const PromiseItem = require('../models/Promise');

// @route   GET /api/promises
exports.getPromises = async (req, res, next) => {
    try {
        const { status, category, politician } = req.query;
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (politician) query.politician = politician;

        const promises = await PromiseItem.find(query)
            .populate('politician', 'name username avatar role verified party')
            .sort({ date: -1 });

        res.json({ success: true, promises });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/promises
exports.createPromise = async (req, res, next) => {
    try {
        const { title, description, status, date, category } = req.body;
        const promise = await PromiseItem.create({
            title, description, status, date, category,
            politician: req.user.id,
        });
        const populated = await promise.populate('politician', 'name username avatar role verified party');
        res.status(201).json({ success: true, promise: populated });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/promises/:id
exports.updatePromise = async (req, res, next) => {
    try {
        const promise = await PromiseItem.findById(req.params.id);
        if (!promise) return res.status(404).json({ success: false, message: 'Promise not found' });

        if (promise.politician.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updated = await PromiseItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('politician', 'name username avatar role verified party');

        res.json({ success: true, promise: updated });
    } catch (error) {
        next(error);
    }
};
