'use client';
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import type { RealtimeChannel } from '@supabase/supabase-js';

/* ─── Socket-compatible interface ─── 
   Maintains the same API so consumers (messages, wallet, debates) 
   can migrate incrementally from socket.emit/on to Supabase channels. */

interface SocketLike {
    emit: (event: string, data?: unknown) => void;
    on: (event: string, cb: (...args: unknown[]) => void) => void;
    off: (event: string, cb: (...args: unknown[]) => void) => void;
}

interface SocketContextType {
    socket: SocketLike | null;
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
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<Record<string, { userId: string; userName: string }[]>>({});
    const [connected, setConnected] = useState(false);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const listenersRef = useRef<Map<string, Set<(...args: unknown[]) => void>>>(new Map());
    const presenceRef = useRef<RealtimeChannel | null>(null);

    // ─── Local event bus (replaces Socket.IO event emitter) ───
    const addListener = useCallback((event: string, cb: (...args: unknown[]) => void) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, new Set());
        }
        listenersRef.current.get(event)!.add(cb);
    }, []);

    const removeListener = useCallback((event: string, cb: (...args: unknown[]) => void) => {
        listenersRef.current.get(event)?.delete(cb);
    }, []);

    const dispatch = useCallback((event: string, ...args: unknown[]) => {
        listenersRef.current.get(event)?.forEach(cb => {
            try { cb(...args); } catch (e) { console.error(`[Realtime] listener error for ${event}:`, e); }
        });
    }, []);

    // ─── Socket-like object ───
    const socketLike = useRef<SocketLike>({
        emit: (event: string, data?: unknown) => {
            // Broadcast via Supabase Realtime channel
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event,
                    payload: data as Record<string, unknown> || {},
                });
            }
        },
        on: (event: string, cb: (...args: unknown[]) => void) => {
            addListener(event, cb);
        },
        off: (event: string, cb: (...args: unknown[]) => void) => {
            removeListener(event, cb);
        },
    }).current;

    // ─── Connect to Supabase Realtime ───
    useEffect(() => {
        if (!user?.id) {
            // Disconnect if not logged in
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
            if (presenceRef.current) {
                supabase.removeChannel(presenceRef.current);
                presenceRef.current = null;
            }
            setConnected(false);
            setOnlineUsers([]);
            return;
        }

        // ─── Main broadcast channel for messaging events ───
        const mainChannel = supabase.channel('app:global', {
            config: { broadcast: { self: false } },
        });

        mainChannel
            .on('broadcast', { event: 'message:new' }, (payload) => {
                dispatch('message:new', payload.payload);
            })
            .on('broadcast', { event: 'conversation:new' }, (payload) => {
                dispatch('conversation:new', payload.payload);
            })
            .on('broadcast', { event: 'conversation:updated' }, (payload) => {
                dispatch('conversation:updated', payload.payload);
            })
            .on('broadcast', { event: 'message:reaction' }, (payload) => {
                dispatch('message:reaction', payload.payload);
            })
            .on('broadcast', { event: 'wallet:update' }, (payload) => {
                dispatch('wallet:update', payload.payload);
            })
            .on('broadcast', { event: 'debate:update' }, (payload) => {
                dispatch('debate:update', payload.payload);
            })
            .on('broadcast', { event: 'typing:start' }, (payload) => {
                const { conversationId, userId, userName } = payload.payload as {
                    conversationId: string; userId: string; userName: string;
                };
                if (userId === user.id) return; // Don't show own typing
                setTypingUsers(prev => {
                    const existing = prev[conversationId] || [];
                    if (existing.find(t => t.userId === userId)) return prev;
                    return { ...prev, [conversationId]: [...existing, { userId, userName }] };
                });
                // Auto-clear after 3 seconds
                setTimeout(() => {
                    setTypingUsers(prev => {
                        const existing = prev[conversationId] || [];
                        return { ...prev, [conversationId]: existing.filter(t => t.userId !== userId) };
                    });
                }, 3000);
            })
            .on('broadcast', { event: 'typing:stop' }, (payload) => {
                const { conversationId, userId } = payload.payload as {
                    conversationId: string; userId: string;
                };
                setTypingUsers(prev => {
                    const existing = prev[conversationId] || [];
                    return { ...prev, [conversationId]: existing.filter(t => t.userId !== userId) };
                });
            })
            .subscribe((status) => {
                setConnected(status === 'SUBSCRIBED');
            });

        channelRef.current = mainChannel;

        // ─── Presence channel for online users ───
        const presenceChannel = supabase.channel('app:presence', {
            config: { presence: { key: user.id } },
        });

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const userIds = Object.keys(state);
                setOnlineUsers(userIds);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        presenceRef.current = presenceChannel;

        // ─── Database change listeners for messages table ───
        const dbChannel = supabase.channel('db:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const msg = payload.new;
                dispatch('message:new', {
                    message: {
                        _id: msg.id,
                        id: msg.id,
                        content: msg.content,
                        sender: { _id: msg.sender_id, id: msg.sender_id },
                        conversation: msg.conversation_id,
                        createdAt: msg.created_at,
                    },
                    conversationId: msg.conversation_id,
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(mainChannel);
            supabase.removeChannel(presenceChannel);
            supabase.removeChannel(dbChannel);
            channelRef.current = null;
            presenceRef.current = null;
            setConnected(false);
        };
    }, [user?.id, dispatch]);

    // Update socketLike refs when callbacks change
    useEffect(() => {
        socketLike.on = addListener;
        socketLike.off = removeListener;
    }, [addListener, removeListener, socketLike]);

    const value = { socket: socketLike, onlineUsers, typingUsers, connected };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
