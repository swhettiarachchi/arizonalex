'use client';
import { useState } from 'react';
import { conversations, chatMessages, users } from '@/lib/mock-data';
import { SearchIcon, PenIcon, PhoneIcon, VideoIcon, InfoIcon, SmileIcon, PaperclipIcon, SendIcon, VerifiedIcon } from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';


export default function MessagesPage() {
    const { requireAuth } = useAuthGate();
    const [activeChat, setActiveChat] = useState<string | null>('1');
    const [newMsg, setNewMsg] = useState('');
    const [msgs, setMsgs] = useState(chatMessages);
    const currentUser = users[4];

    const sendMessage = () => {
        if (!newMsg.trim()) return;
        setMsgs(prev => [...prev, { id: String(prev.length + 1), sender: currentUser, content: newMsg, timestamp: 'Just now', read: false }]);
        setNewMsg('');
    };

    return (
        <div className="page-container">
            <div className="feed-column" style={{ borderRight: 'none' }}>
                <div className="messages-layout">
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
                                        <div key={msg.id} className={`chat-bubble ${msg.sender.id === currentUser.id ? 'sent' : 'received'}`}>
                                            {msg.content}
                                            <div className="chat-bubble-time" style={{ color: msg.sender.id === currentUser.id ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)' }}>{msg.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="chat-input-bar">
                                    <button className="btn btn-icon"><SmileIcon size={18} /></button>
                                    <button className="btn btn-icon"><PaperclipIcon size={18} /></button>
                                    <input className="chat-input" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') requireAuth(() => sendMessage()); }} />
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
