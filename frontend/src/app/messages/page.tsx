'use client';
import { useState, useEffect } from 'react';
import { users } from '@/lib/mock-data';
import { SearchIcon, PenIcon, PhoneIcon, VideoIcon, InfoIcon, SmileIcon, PaperclipIcon, SendIcon, VerifiedIcon, ArrowLeftIcon } from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { useAuth } from '@/components/providers/AuthProvider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Conversation = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Message = any;

export default function MessagesPage() {
    const { requireAuth } = useAuthGate();
    const { user: authUser, isLoggedIn } = useAuth();
    const [activeChat, setActiveChat] = useState<string | null>('1');
    const [newMsg, setNewMsg] = useState('');
    const [msgs, setMsgs] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const fallbackUser = users[4];

    // Fetch conversations on mount
    useEffect(() => {
        fetch('/api/messages')
            .then(r => r.json())
            .then(data => { if (data.conversations) setConversations(data.conversations); })
            .catch(() => { });
    }, []);

    // Fetch messages when activeChat changes
    useEffect(() => {
        if (!activeChat) return;
        fetch(`/api/messages/${activeChat}`)
            .then(r => r.json())
            .then(data => { if (data.messages) setMsgs(data.messages); })
            .catch(() => { });
    }, [activeChat]);

    const currentUserId = authUser?.id || fallbackUser.id;

    const sendMessage = async () => {
        if (!newMsg.trim() || !activeChat) return;
        const msgCopy = newMsg;
        setNewMsg('');
        try {
            const res = await fetch(`/api/messages/${activeChat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: msgCopy }),
            });
            const data = await res.json();
            if (data.message) {
                // Mark the message as "sent" by the current user
                const sentMsg = { ...data.message, sender: { ...data.message.sender, id: currentUserId } };
                setMsgs(prev => [...prev, sentMsg]);
                setConversations(prev => prev.map(c => c.id === activeChat ? { ...c, lastMessage: msgCopy, timestamp: 'Just now' } : c));
            } else {
                // Fallback: optimistic update
                setMsgs(prev => [...prev, { id: `msg_${Date.now()}`, sender: { id: currentUserId }, content: msgCopy, timestamp: 'Just now', read: false }]);
            }
        } catch {
            setMsgs(prev => [...prev, { id: `msg_${Date.now()}`, sender: { id: currentUserId }, content: msgCopy, timestamp: 'Just now', read: false }]);
        }
    };

    return (
        <div className="page-container">
            <div className="feed-column" style={{ borderRight: 'none' }}>
                <div className="messages-layout">
                    <div className={`messages-sidebar ${activeChat ? 'hidden-mobile' : ''}`}>
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
                            {conversations.map(conv => (
                                <div key={conv.id} className={`chat-item ${activeChat === conv.id ? 'active' : ''}`} onClick={() => setActiveChat(conv.id)}>
                                    <UserAvatar name={conv.participant.name} avatar={conv.participant.avatar} />
                                    <div className="chat-item-info">
                                        <div className="chat-item-name">
                                            {conv.participant.name}
                                            {conv.participant.verified && <VerifiedIcon size={13} />}
                                        </div>
                                        <div className="chat-item-msg">{conv.lastMessage}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <span className="chat-item-time">{conv.timestamp}</span>
                                        {conv.unread > 0 && <span className="chat-unread">{conv.unread}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`messages-chat ${!activeChat ? 'hidden-mobile' : ''}`}>
                        {activeChat ? (
                            <>
                                <div className="page-header">
                                    <div className="page-header-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <button className="btn btn-icon show-mobile" onClick={() => setActiveChat(null)} style={{ marginRight: -4 }}>
                                                <ArrowLeftIcon size={18} />
                                            </button>
                                            <UserAvatar name={conversations.find(c => c.id === activeChat)?.participant.name || ''} avatar={conversations.find(c => c.id === activeChat)?.participant.avatar} size="sm" />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{conversations.find(c => c.id === activeChat)?.participant.name}</div>
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
                                    {msgs.map((msg) => (
                                        <div key={msg.id} className={`chat-bubble ${msg.sender.id === currentUserId ? 'sent' : 'received'}`}>
                                            {msg.content}
                                            <div className="chat-bubble-time" style={{ color: msg.sender.id === currentUserId ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)' }}>{msg.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="chat-input-bar">
                                    <button className="btn btn-icon"><SmileIcon size={18} /></button>
                                    <button className="btn btn-icon"><PaperclipIcon size={18} /></button>
                                    <input className="chat-input" placeholder={isLoggedIn ? 'Type a message...' : 'Sign in to send messages'} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') requireAuth(() => sendMessage()); }} />
                                    <button className="chat-send" onClick={() => requireAuth(() => sendMessage())}><SendIcon size={18} /></button>
                                </div>
                            </>
                        ) : (
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
