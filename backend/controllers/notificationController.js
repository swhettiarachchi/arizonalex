const Notification = require('../models/Notification');

// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 30 } = req.query;
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('actor', 'name username avatar role verified')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });
        const total = await Notification.countDocuments({ recipient: req.user.id });

        res.json({ success: true, count: notifications.length, total, unreadCount, notifications });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, notification });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
