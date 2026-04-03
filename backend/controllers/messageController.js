const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const CallLog = require('../models/CallLog');
const { emitToConversation, emitToUser } = require('../utils/socketManager');

// ═══════════════════════════════════════
//  CONVERSATIONS
// ═══════════════════════════════════════

// GET /api/messages/conversations
exports.getConversations = async (req, res, next) => {
    try {
        const { filter } = req.query; // all | unread | groups
        const query = { participants: req.user.id };
        if (filter === 'groups') query.type = 'group';

        const conversations = await Conversation.find(query)
            .populate('participants', 'name username avatar role verified')
            .populate('lastMessageBy', 'name username')
            .sort({ lastMessageAt: -1, updatedAt: -1 });

        const result = conversations.map((conv) => {
            const json = conv.toJSON();
            json.unread = conv.unreadCounts.get(req.user.id.toString()) || 0;
            json.isPinned = conv.pinnedBy.some(id => id.toString() === req.user.id.toString());
            json.isMuted = conv.mutedBy.some(id => id.toString() === req.user.id.toString());
            json.isArchived = conv.archivedBy.some(id => id.toString() === req.user.id.toString());
            return json;
        });

        // Filter archived out unless explicitly requested
        const filtered = req.query.archived === 'true' ? result : result.filter(c => !c.isArchived);
        // Filter unread
        const final = filter === 'unread' ? filtered.filter(c => c.unread > 0) : filtered;

        res.json({ success: true, conversations: final });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/conversations (create DM)
exports.createConversation = async (req, res, next) => {
    try {
        let { participantId, content, username } = req.body;

        if (!participantId && !username) return res.status(400).json({ success: false, message: 'participantId or username is required' });

        if (username && (!participantId || participantId.length < 24)) {
            const User = require('../models/User');
            const targetUser = await User.findOne({ username });
            if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
            participantId = targetUser._id;
        }

        // Check existing DM
        let conversation = await Conversation.findOne({
            type: 'dm',
            participants: { $all: [req.user.id, participantId], $size: 2 },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                type: 'dm',
                participants: [req.user.id, participantId],
                lastMessage: content || '',
                lastMessageAt: new Date(),
                lastMessageBy: req.user.id,
            });
        }

        if (content) {
            const msg = await Message.create({ conversation: conversation._id, sender: req.user.id, content, type: 'text', status: 'sent' });
            conversation.lastMessage = content;
            conversation.lastMessageAt = new Date();
            conversation.lastMessageBy = req.user.id;
            conversation.unreadCounts.set(participantId.toString(), 1);
            await conversation.save();

            // Real-time notification
            const io = req.app.get('io');
            if (io) {
                const populated = await msg.populate('sender', 'name username avatar');
                emitToUser(io, participantId.toString(), 'message:new', { message: populated, conversationId: conversation._id });
            }
        }

        const populated = await conversation.populate('participants', 'name username avatar role verified');
        res.status(201).json({ success: true, conversation: populated });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/groups (create group)
exports.createGroup = async (req, res, next) => {
    try {
        const { name, participantIds = [], description = '' } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });

        const allParticipants = [req.user.id, ...participantIds.filter(id => id !== req.user.id.toString())];

        const conversation = await Conversation.create({
            type: 'group',
            name,
            description,
            participants: allParticipants,
            admins: [req.user.id],
            createdBy: req.user.id,
            lastMessage: `Group "${name}" created`,
            lastMessageAt: new Date(),
            lastMessageBy: req.user.id,
        });

        // System message
        await Message.create({
            conversation: conversation._id,
            sender: req.user.id,
            content: `created the group "${name}"`,
            type: 'system',
        });

        const populated = await conversation.populate('participants', 'name username avatar role verified');

        // Notify all participants
        const io = req.app.get('io');
        if (io) {
            allParticipants.forEach(pid => {
                emitToUser(io, pid.toString(), 'conversation:new', { conversation: populated });
            });
        }

        res.status(201).json({ success: true, conversation: populated });
    } catch (error) {
        next(error);
    }
};

// PUT /api/messages/groups/:id
exports.updateGroup = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv || conv.type !== 'group') return res.status(404).json({ success: false, message: 'Group not found' });
        
        const isAdmin = conv.admins.some(id => id.toString() === req.user.id.toString());
        const isMod = conv.moderators.some(id => id.toString() === req.user.id.toString());
        if (!isAdmin && !isMod) return res.status(403).json({ success: false, message: 'Not authorized' });

        const { name, description, avatar } = req.body;
        if (name) conv.name = name;
        if (description !== undefined) conv.description = description;
        if (avatar) conv.avatar = avatar;
        await conv.save();

        const populated = await conv.populate('participants', 'name username avatar role verified');
        
        const io = req.app.get('io');
        if (io) emitToConversation(io, conv._id.toString(), 'conversation:updated', { conversation: populated });

        res.json({ success: true, conversation: populated });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/groups/:id/members
exports.addMembers = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv || conv.type !== 'group') return res.status(404).json({ success: false, message: 'Group not found' });
        
        const isAdmin = conv.admins.some(id => id.toString() === req.user.id.toString());
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can add members' });

        const { userIds = [] } = req.body;
        const newIds = userIds.filter(id => !conv.participants.some(p => p.toString() === id));
        conv.participants.push(...newIds);
        await conv.save();

        // System message
        if (newIds.length > 0) {
            await Message.create({ conversation: conv._id, sender: req.user.id, content: `added ${newIds.length} member(s)`, type: 'system' });
        }

        const populated = await conv.populate('participants', 'name username avatar role verified');
        const io = req.app.get('io');
        if (io) emitToConversation(io, conv._id.toString(), 'conversation:updated', { conversation: populated });

        res.json({ success: true, conversation: populated });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/messages/groups/:id/members/:userId
exports.removeMember = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv || conv.type !== 'group') return res.status(404).json({ success: false, message: 'Group not found' });
        
        const isAdmin = conv.admins.some(id => id.toString() === req.user.id.toString());
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can remove members' });

        conv.participants = conv.participants.filter(p => p.toString() !== req.params.userId);
        conv.admins = conv.admins.filter(a => a.toString() !== req.params.userId);
        conv.moderators = conv.moderators.filter(m => m.toString() !== req.params.userId);
        await conv.save();

        await Message.create({ conversation: conv._id, sender: req.user.id, content: `removed a member`, type: 'system' });

        const io = req.app.get('io');
        if (io) {
            emitToConversation(io, conv._id.toString(), 'conversation:updated', { conversation: conv });
            emitToUser(io, req.params.userId, 'conversation:removed', { conversationId: conv._id });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/groups/:id/leave
exports.leaveGroup = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv || conv.type !== 'group') return res.status(404).json({ success: false, message: 'Group not found' });

        conv.participants = conv.participants.filter(p => p.toString() !== req.user.id.toString());
        conv.admins = conv.admins.filter(a => a.toString() !== req.user.id.toString());
        conv.moderators = conv.moderators.filter(m => m.toString() !== req.user.id.toString());
        
        // If no admin left, promote first participant
        if (conv.admins.length === 0 && conv.participants.length > 0) {
            conv.admins.push(conv.participants[0]);
        }
        await conv.save();

        await Message.create({ conversation: conv._id, sender: req.user.id, content: 'left the group', type: 'system' });

        const io = req.app.get('io');
        if (io) emitToConversation(io, conv._id.toString(), 'conversation:updated', { conversation: conv });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/messages/groups/:id
exports.deleteGroup = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv || conv.type !== 'group') return res.status(404).json({ success: false, message: 'Group not found' });
        
        const isAdmin = conv.admins.some(id => id.toString() === req.user.id.toString());
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can delete groups' });

        const io = req.app.get('io');
        if (io) emitToConversation(io, conv._id.toString(), 'conversation:deleted', { conversationId: conv._id });

        await Message.deleteMany({ conversation: conv._id });
        await Conversation.findByIdAndDelete(conv._id);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  MESSAGES
// ═══════════════════════════════════════

// GET /api/messages/conversations/:id
exports.getMessages = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conversation.participants.some(p => p.toString() === req.user.id.toString())) {
            return res.status(403).json({ success: false, message: 'Not a participant' });
        }

        const { page = 1, limit = 50 } = req.query;
        const messages = await Message.find({ conversation: req.params.id, deleted: { $ne: true } })
            .populate('sender', 'name username avatar')
            .populate('replyTo', 'content sender')
            .populate('mentions', 'name username')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: 1 });

        // Mark as read + delivered
        await Message.updateMany(
            { conversation: req.params.id, sender: { $ne: req.user.id }, status: { $ne: 'seen' } },
            { status: 'seen', seenAt: new Date(), $addToSet: { seenBy: req.user.id }, read: true }
        );
        conversation.unreadCounts.set(req.user.id.toString(), 0);
        await conversation.save();

        // Emit read receipt
        const io = req.app.get('io');
        if (io) {
            emitToConversation(io, req.params.id, 'message:status', { conversationId: req.params.id, readBy: req.user.id, status: 'seen' });
        }

        res.json({ success: true, messages, conversation });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/conversations/:id
exports.sendMessage = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conversation.participants.some(p => p.toString() === req.user.id.toString())) {
            return res.status(403).json({ success: false, message: 'Not a participant' });
        }

        const { content = '', type = 'text', mediaUrl = '', mediaMimeType = '', mediaSize = 0, voiceDuration = 0, fileName = '', replyTo, mentions = [] } = req.body;

        const message = await Message.create({
            conversation: req.params.id,
            sender: req.user.id,
            content,
            type,
            mediaUrl,
            mediaMimeType,
            mediaSize,
            voiceDuration,
            fileName,
            replyTo: replyTo || undefined,
            mentions,
            status: 'sent',
        });

        // Update conversation
        const preview = type === 'text' ? content : type === 'voice' ? '🎤 Voice message' : type === 'image' ? '📷 Photo' : type === 'video' ? '🎥 Video' : '📎 File';
        conversation.lastMessage = preview.substring(0, 100);
        conversation.lastMessageAt = new Date();
        conversation.lastMessageBy = req.user.id;
        conversation.participants.forEach((pid) => {
            if (pid.toString() !== req.user.id.toString()) {
                const current = conversation.unreadCounts.get(pid.toString()) || 0;
                conversation.unreadCounts.set(pid.toString(), current + 1);
            }
        });
        await conversation.save();

        const populated = await message.populate([
            { path: 'sender', select: 'name username avatar' },
            { path: 'replyTo', select: 'content sender', populate: { path: 'sender', select: 'name' } },
        ]);

        // Real-time: emit to conversation room
        const io = req.app.get('io');
        if (io) {
            emitToConversation(io, req.params.id, 'message:new', { message: populated, conversationId: req.params.id });
        }

        res.status(201).json({ success: true, message: populated });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  REACTIONS & PIN
// ═══════════════════════════════════════

// POST /api/messages/:messageId/react
exports.reactToMessage = async (req, res, next) => {
    try {
        const { emoji } = req.body;
        if (!emoji) return res.status(400).json({ success: false, message: 'Emoji required' });

        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

        // Toggle reaction
        const existing = message.reactions.findIndex(r => r.user.toString() === req.user.id.toString() && r.emoji === emoji);
        if (existing > -1) {
            message.reactions.splice(existing, 1);
        } else {
            message.reactions.push({ emoji, user: req.user.id });
        }
        await message.save();

        const io = req.app.get('io');
        if (io) emitToConversation(io, message.conversation.toString(), 'message:reaction', { messageId: message._id, reactions: message.reactions });

        res.json({ success: true, reactions: message.reactions });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/:messageId/pin
exports.pinMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

        message.pinned = !message.pinned;
        await message.save();

        // Update conversation pinned list
        const conv = await Conversation.findById(message.conversation);
        if (conv) {
            if (message.pinned) {
                conv.pinnedMessages.addToSet(message._id);
            } else {
                conv.pinnedMessages.pull(message._id);
            }
            await conv.save();
        }

        const io = req.app.get('io');
        if (io) emitToConversation(io, message.conversation.toString(), 'message:pinned', { messageId: message._id, pinned: message.pinned });

        res.json({ success: true, pinned: message.pinned });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════

// GET /api/messages/search?q=...
exports.searchMessages = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, messages: [] });

        // Find user's conversations
        const convIds = (await Conversation.find({ participants: req.user.id }).select('_id')).map(c => c._id);

        const messages = await Message.find({
            conversation: { $in: convIds },
            content: { $regex: q, $options: 'i' },
            deleted: { $ne: true },
        })
            .populate('sender', 'name username avatar')
            .populate('conversation', 'name type participants')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  CONVERSATION SETTINGS
// ═══════════════════════════════════════

// POST /api/messages/conversations/:id/pin
exports.pinConversation = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ success: false, message: 'Not found' });
        
        const isPinned = conv.pinnedBy.some(id => id.toString() === req.user.id.toString());
        if (isPinned) {
            conv.pinnedBy.pull(req.user.id);
        } else {
            conv.pinnedBy.addToSet(req.user.id);
        }
        await conv.save();
        res.json({ success: true, pinned: !isPinned });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/conversations/:id/mute
exports.muteConversation = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ success: false, message: 'Not found' });
        
        const isMuted = conv.mutedBy.some(id => id.toString() === req.user.id.toString());
        if (isMuted) {
            conv.mutedBy.pull(req.user.id);
        } else {
            conv.mutedBy.addToSet(req.user.id);
        }
        await conv.save();
        res.json({ success: true, muted: !isMuted });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/conversations/:id/archive
exports.archiveConversation = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ success: false, message: 'Not found' });
        
        const isArchived = conv.archivedBy.some(id => id.toString() === req.user.id.toString());
        if (isArchived) {
            conv.archivedBy.pull(req.user.id);
        } else {
            conv.archivedBy.addToSet(req.user.id);
        }
        await conv.save();
        res.json({ success: true, archived: !isArchived });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  CALLS
// ═══════════════════════════════════════

// POST /api/messages/calls
exports.logCall = async (req, res, next) => {
    try {
        const { conversationId, type, participants, agoraChannel } = req.body;
        const callLog = await CallLog.create({
            conversation: conversationId,
            initiator: req.user.id,
            participants,
            type,
            status: 'ringing',
            agoraChannel,
            startedAt: new Date(),
        });
        res.status(201).json({ success: true, call: callLog });
    } catch (error) {
        next(error);
    }
};

// PUT /api/messages/calls/:id
exports.updateCall = async (req, res, next) => {
    try {
        const call = await CallLog.findById(req.params.id);
        if (!call) return res.status(404).json({ success: false, message: 'Call not found' });
        
        const { status, duration } = req.body;
        if (status) call.status = status;
        if (duration) call.duration = duration;
        if (status === 'ended' || status === 'missed' || status === 'rejected') {
            call.endedAt = new Date();
        }
        if (status === 'connected' && !call.startedAt) {
            call.startedAt = new Date();
        }
        await call.save();
        res.json({ success: true, call });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  BLOCK / UNBLOCK
// ═══════════════════════════════════════

// POST /api/messages/block
exports.blockUser = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
        
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: userId } });
        
        const io = req.app.get('io');
        if (io) emitToUser(io, req.user.id.toString(), 'user:blocked', { blockedUserId: userId });
        
        res.json({ success: true, blocked: true });
    } catch (error) {
        next(error);
    }
};

// POST /api/messages/unblock
exports.unblockUser = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
        
        await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: userId } });
        
        res.json({ success: true, blocked: false });
    } catch (error) {
        next(error);
    }
};

// GET /api/messages/blocked
exports.getBlockedUsers = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).populate('blockedUsers', 'name username avatar');
        res.json({ success: true, blockedUsers: user?.blockedUsers || [] });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  EDIT / DELETE MESSAGES
// ═══════════════════════════════════════

// PUT /api/messages/:messageId/edit
exports.editMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Not found' });
        if (message.sender.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, message: 'Not your message' });
        
        message.content = req.body.content || message.content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();
        
        const io = req.app.get('io');
        if (io) emitToConversation(io, message.conversation.toString(), 'message:edited', { messageId: message._id, content: message.content });
        
        res.json({ success: true, message });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/messages/:messageId
exports.deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Not found' });
        if (message.sender.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, message: 'Not your message' });
        
        message.deleted = true;
        message.content = 'This message was deleted';
        await message.save();
        
        const io = req.app.get('io');
        if (io) emitToConversation(io, message.conversation.toString(), 'message:deleted', { messageId: message._id });
        
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
//  SEARCH USERS (for adding to groups)
// ═══════════════════════════════════════

// GET /api/messages/users/search?q=...
exports.searchUsers = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const { q } = req.query;
        if (!q) return res.json({ success: true, users: [] });
        
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
            ],
            _id: { $ne: req.user.id },
        }).select('name username avatar role verified').limit(20);
        
        res.json({ success: true, users });
    } catch (error) {
        next(error);
    }
};
