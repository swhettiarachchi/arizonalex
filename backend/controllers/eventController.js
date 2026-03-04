const Event = require('../models/Event');

// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
    try {
        const { type, upcoming } = req.query;
        const query = {};
        if (type) query.type = type;
        if (upcoming === 'true') query.date = { $gte: new Date() };

        const events = await Event.find(query)
            .populate('organizer', 'name username avatar role verified')
            .sort({ date: 1 });

        res.json({ success: true, events });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
    try {
        const { title, type, date, location, description } = req.body;
        const event = await Event.create({
            title, type, date, location, description,
            organizer: req.user.id,
        });
        const populated = await event.populate('organizer', 'name username avatar role verified');
        res.status(201).json({ success: true, event: populated });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('organizer', 'name username avatar role verified');

        res.json({ success: true, event: updated });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/events/:id/attend
exports.attendEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const isAttending = event.attendees.includes(req.user.id);
        if (isAttending) {
            await Event.findByIdAndUpdate(req.params.id, { $pull: { attendees: req.user.id } });
            res.json({ success: true, attending: false });
        } else {
            await Event.findByIdAndUpdate(req.params.id, { $addToSet: { attendees: req.user.id } });
            res.json({ success: true, attending: true });
        }
    } catch (error) {
        next(error);
    }
};
