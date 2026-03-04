const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @route   GET /api/messages/conversations
exports.getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id })
            .populate('participants', 'name username avatar role verified')
            .sort({ updatedAt: -1 });

        // Attach unread count per user
        const result = conversations.map((conv) => ({
            ...conv.toJSON(),
            unread: conv.unreadCounts.get(req.user.id.toString()) || 0,
        }));

        res.json({ success: true, conversations: result });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/messages/conversations/:id
exports.getMessages = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conversation.participants.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not a participant' });
        }

        const { page = 1, limit = 50 } = req.query;
        const messages = await Message.find({ conversation: req.params.id })
            .populate('sender', 'name username avatar')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: 1 });

        // Mark as read
        await Message.updateMany(
            { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
            { read: true }
        );
        conversation.unreadCounts.set(req.user.id.toString(), 0);
        await conversation.save();

        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/messages/conversations/:id
exports.sendMessage = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conversation.participants.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not a participant' });
        }

        const message = await Message.create({
            conversation: req.params.id,
            sender: req.user.id,
            content: req.body.content,
        });

        // Update conversation
        conversation.lastMessage = req.body.content;
        conversation.participants.forEach((pid) => {
            if (pid.toString() !== req.user.id.toString()) {
                const current = conversation.unreadCounts.get(pid.toString()) || 0;
                conversation.unreadCounts.set(pid.toString(), current + 1);
            }
        });
        await conversation.save();

        const populated = await message.populate('sender', 'name username avatar');
        res.status(201).json({ success: true, message: populated });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/messages/conversations  (create new conversation)
exports.createConversation = async (req, res, next) => {
    try {
        const { participantId, content } = req.body;

        if (!participantId) return res.status(400).json({ success: false, message: 'participantId is required' });

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, participantId], $size: 2 },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, participantId],
                lastMessage: content || '',
            });
        }

        // Send initial message if content provided
        if (content) {
            await Message.create({ conversation: conversation._id, sender: req.user.id, content });
            conversation.lastMessage = content;
            conversation.unreadCounts.set(participantId.toString(), 1);
            await conversation.save();
        }

        const populated = await conversation.populate('participants', 'name username avatar role verified');
        res.status(201).json({ success: true, conversation: populated });
    } catch (error) {
        next(error);
    }
};
