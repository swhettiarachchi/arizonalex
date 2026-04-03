/**
 * Socket.IO Manager — handles real-time events and online user tracking
 */
const onlineUsers = new Map(); // userId -> Set<socketId>

function initSocket(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // ── User goes online ──
        socket.on('user:online', (userId) => {
            if (!userId) return;
            socket.userId = userId;
            if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
            onlineUsers.get(userId).add(socket.id);
            // Join personal room for targeted events
            socket.join(`user:${userId}`);
            // Broadcast online status
            io.emit('users:online', getOnlineUserIds());
        });

        // ── Join conversation room ──
        socket.on('conversation:join', (conversationId) => {
            if (conversationId) socket.join(`conv:${conversationId}`);
        });

        socket.on('conversation:leave', (conversationId) => {
            if (conversationId) socket.leave(`conv:${conversationId}`);
        });

        // ── Typing indicators ──
        socket.on('typing:start', ({ conversationId, userId, userName }) => {
            socket.to(`conv:${conversationId}`).emit('typing:start', { conversationId, userId, userName });
        });

        socket.on('typing:stop', ({ conversationId, userId }) => {
            socket.to(`conv:${conversationId}`).emit('typing:stop', { conversationId, userId });
        });

        // ── Message events (emitted by server after DB save) ──
        // These are triggered from the controller via emitToConversation

        // ── Call signaling ──
        socket.on('call:initiate', (data) => {
            // data: { conversationId, callerId, callerName, callerAvatar, callType, participants[] }
            data.participants.forEach((uid) => {
                if (uid !== data.callerId) {
                    io.to(`user:${uid}`).emit('call:incoming', data);
                }
            });
        });

        socket.on('call:accept', (data) => {
            io.to(`user:${data.callerId}`).emit('call:accepted', data);
        });

        socket.on('call:reject', (data) => {
            io.to(`user:${data.callerId}`).emit('call:rejected', data);
        });

        socket.on('call:end', (data) => {
            if (data.conversationId) {
                io.to(`conv:${data.conversationId}`).emit('call:ended', data);
            }
        });

        // ── Message read receipts ──
        socket.on('message:read', ({ conversationId, messageIds, readBy }) => {
            socket.to(`conv:${conversationId}`).emit('message:read', { conversationId, messageIds, readBy });
        });

        // ── Debate room events ──
        socket.on('debate:join', (debateId) => {
            if (debateId) {
                socket.join(`debate:${debateId}`);
                socket.to(`debate:${debateId}`).emit('debate:user_joined', {
                    debateId,
                    userId: socket.userId,
                });
            }
        });

        socket.on('debate:leave', (debateId) => {
            if (debateId) {
                socket.leave(`debate:${debateId}`);
                socket.to(`debate:${debateId}`).emit('debate:user_left', {
                    debateId,
                    userId: socket.userId,
                });
            }
        });

        // Real-time debate typing indicator
        socket.on('debate:typing', ({ debateId, userId, userName }) => {
            socket.to(`debate:${debateId}`).emit('debate:typing', { debateId, userId, userName });
        });

        socket.on('debate:stop_typing', ({ debateId, userId }) => {
            socket.to(`debate:${debateId}`).emit('debate:stop_typing', { debateId, userId });
        });

        // ── Disconnect ──
        socket.on('disconnect', () => {
            const userId = socket.userId;
            if (userId && onlineUsers.has(userId)) {
                onlineUsers.get(userId).delete(socket.id);
                if (onlineUsers.get(userId).size === 0) {
                    onlineUsers.delete(userId);
                }
            }
            io.emit('users:online', getOnlineUserIds());
        });
    });
}

function getOnlineUserIds() {
    return Array.from(onlineUsers.keys());
}

function getOnlineCount() {
    return onlineUsers.size;
}

/** Emit an event to all sockets of a specific user */
function emitToUser(io, userId, event, data) {
    io.to(`user:${userId}`).emit(event, data);
}

/** Emit an event to all members of a conversation */
function emitToConversation(io, conversationId, event, data) {
    io.to(`conv:${conversationId}`).emit(event, data);
}

module.exports = { initSocket, getOnlineUserIds, getOnlineCount, emitToUser, emitToConversation };
