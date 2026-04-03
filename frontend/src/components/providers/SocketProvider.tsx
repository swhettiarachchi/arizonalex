'use client';
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
    typingUsers: Record<string, { userId: string; userName: string }[]>;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    typingUsers: {},
    connected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<Record<string, { userId: string; userName: string }[]>>({});
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user?.id) {
            // Disconnect if logged out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Connect to Socket.IO server
        const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        const s = io(backendUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        s.on('connect', () => {
            setConnected(true);
            s.emit('user:online', user.id);
        });

        s.on('disconnect', () => {
            setConnected(false);
        });

        s.on('users:online', (userIds: string[]) => {
            setOnlineUsers(userIds);
        });

        s.on('typing:start', ({ conversationId, userId, userName }: { conversationId: string; userId: string; userName: string }) => {
            setTypingUsers(prev => {
                const existing = prev[conversationId] || [];
                if (existing.find(t => t.userId === userId)) return prev;
                return { ...prev, [conversationId]: [...existing, { userId, userName }] };
            });
        });

        s.on('typing:stop', ({ conversationId, userId }: { conversationId: string; userId: string }) => {
            setTypingUsers(prev => {
                const existing = prev[conversationId] || [];
                return { ...prev, [conversationId]: existing.filter(t => t.userId !== userId) };
            });
        });

        socketRef.current = s;
        setSocket(s);

        return () => {
            s.disconnect();
            socketRef.current = null;
            setSocket(null);
            setConnected(false);
        };
    }, [user?.id]);

    const value = { socket, onlineUsers, typingUsers, connected };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
