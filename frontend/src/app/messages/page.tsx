'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { messagesApi, type ApiConversation, type ApiMessage, timeAgo } from '@/lib/api';
import { SearchIcon, PenIcon, PhoneIcon, VideoIcon, InfoIcon, SmileIcon, PaperclipIcon, SendIcon, VerifiedIcon } from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { useAuth } from '@/components/providers/AuthProvider';

export default function MessagesPage() {
    const { requireAuth } = useAuthGate();
    const { isLoggedIn, user } = useAuth();
    const [conversations, setConversations] = useState<ApiConversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ApiMessage[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Load conversations
    useEffect(() => {
        if (!isLoggedIn) { setLoadingConvs(false); return; }
        messagesApi.getConversations()
            .then(res => {
                setConversations(res.conversations);
                if (res.conversations.length > 0) setActiveConvId(res.conversations[0]._id);
            })
            .catch(() => { })
            .finally(() => setLoadingConvs(false));
    }, [isLoggedIn]);

    // Load messages when active conversation changes
    const loadMessages = useCallback(async (convId: string) => {
        setLoadingMsgs(true);
        try {
            const res = await messagesApi.getMessages(convId);
            setMessages(res.messages);
        } catch (_e) { /* ignore */ }
        finally { setLoadingMsgs(false); }
    }, []);

    useEffect(() => {
        if (activeConvId) loadMessages(activeConvId);
    }, [activeConvId, loadMessages]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        requireAuth(async () => {
            if (!newMsg.trim() || !activeConvId) return;
            const content = newMsg.trim();
            setNewMsg('');
            try {
                const res = await messagesApi.sendMessage(activeConvId, content);
                setMessages(prev => [...prev, res.message]);
            } catch (_e) { /* ignore */ }
        });
    };

    const activeConv = conversations.find(c => c._id === activeConvId);

    if (!isLoggedIn) {
        return (
            <div className="page-container">
                <div className="feed-column">
                    <div className="page-header"><h1>Messages</h1></div>
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <SendIcon size={40} />
                        <p style={{ marginTop: 12 }}>Sign in to access your messages</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="feed-column" style={{ borderRight: 'none' }}>
                <div className="messages-layout">
                    {/* Sidebar */}
                    <div className="messages-sidebar">
                        <div className="page-header">
                            <div className="page-header-row">
                                <h1>Messages</h1>
                                <button className="btn btn-icon" title="New Message" onClick={() => requireAuth(() => { })}><PenIcon size={18} /></button>
                            </div>
                        </div>
                        <div style={{ padding: '8px 12px' }}>
                            <div className="search-box"><span className="search-icon"><SearchIcon size={14} /></span><input placeholder="Search messages" /></div>
                        </div>
                        <div className="chat-list">
                            {loadingConvs ? (
                                <div style={{ padding: 16, color: 'var(--text-tertiary)', textAlign: 'center' }}>Loading...</div>
                            ) : conversations.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)' }}>No conversations yet</div>
                            ) : conversations.map(conv => {
                                const other = conv.participants.find(p => p._id !== user?._id) || conv.participants[0];
                                return (
                                    <div key={conv._id} className={`chat-item ${activeConvId === conv._id ? 'active' : ''}`} onClick={() => setActiveConvId(conv._id)}>
                                        <UserAvatar name={other.name} avatar={other.avatar} />
                                        <div className="chat-item-info">
                                            <div className="chat-item-name">
                                                {other.name}
                                                {other.verified && <VerifiedIcon size={13} />}
                                            </div>
                                            <div className="chat-item-msg">{conv.lastMessage}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                            <span className="chat-item-time">{timeAgo(conv.updatedAt)}</span>
                                            {conv.unread > 0 && <span className="chat-unread">{conv.unread}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat panel */}
                    <div className={`messages-chat ${!activeConvId ? 'hidden-mobile' : ''}`}>
                        {activeConv ? (() => {
                            const other = activeConv.participants.find(p => p._id !== user?._id) || activeConv.participants[0];
                            return (
                                <>
                                    <div className="page-header">
                                        <div className="page-header-row">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <UserAvatar name={other.name} avatar={other.avatar} size="sm" />
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{other.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>Online</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-icon" title="Voice Call" onClick={() => requireAuth(() => { })}><PhoneIcon size={17} /></button>
                                                <button className="btn btn-icon" title="Video Call" onClick={() => requireAuth(() => { })}><VideoIcon size={17} /></button>
                                                <button className="btn btn-icon" title="Info" onClick={() => requireAuth(() => { })}><InfoIcon size={17} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="chat-messages">
                                        {loadingMsgs ? (
                                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading messages...</div>
                                        ) : messages.map(msg => (
                                            <div key={msg._id} className={`chat-bubble ${msg.sender._id === user?._id ? 'sent' : 'received'}`}>
                                                {msg.content}
                                                <div className="chat-bubble-time" style={{ color: msg.sender._id === user?._id ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)' }}>
                                                    {timeAgo(msg.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="chat-input-bar">
                                        <button className="btn btn-icon"><SmileIcon size={18} /></button>
                                        <button className="btn btn-icon"><PaperclipIcon size={18} /></button>
                                        <input
                                            className="chat-input"
                                            placeholder="Type a message..."
                                            value={newMsg}
                                            onChange={e => setNewMsg(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                                        />
                                        <button className="chat-send" onClick={sendMessage}><SendIcon size={18} /></button>
                                    </div>
                                </>
                            );
                        })() : (
                            <div className="empty-state">
                                <span className="empty-state-icon" style={{ fontSize: '1.5rem', color: 'var(--text-tertiary)' }}><SendIcon size={48} /></span>
                                <span className="empty-state-title">Select a conversation</span>
                                <span className="empty-state-text">Choose a chat from the sidebar to start messaging</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
