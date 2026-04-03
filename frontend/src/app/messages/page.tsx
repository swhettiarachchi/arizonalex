'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/lib/types';
import { SearchIcon, PenIcon, PhoneIcon, VideoIcon, InfoIcon, SmileIcon, PaperclipIcon, SendIcon, VerifiedIcon, ArrowLeftIcon, MicIcon, PlayIcon, PauseIcon, XIcon, ImageIcon, UsersIcon, PlusIcon, SettingsIcon, CheckIcon, PinIcon, BellOffIcon, ArchiveIcon, ShieldIcon, ShieldOffIcon, LogOutIcon, TrashIcon, ReplyIcon, EditIcon, AlertTriangleIcon } from '@/components/ui/Icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/components/providers/SocketProvider';
import { CommunicationModal } from '@/components/ui/CommunicationModal';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ─── Waveform Voice Player ─── */
const VoicePlayer = ({ src, isSent }: { src: string; isSent: boolean }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState('0:00');
    const [currentTime, setCurrentTime] = useState('0:00');
    const barsRef = useRef<number[]>([]);

    const fmt = (t: number) => { if (!isFinite(t)) return '0:00'; return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`; };

    useEffect(() => { if (!barsRef.current.length) { barsRef.current = Array.from({ length: 28 }, () => 0.2 + Math.random() * 0.8); } }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
        const bars = barsRef.current, gap = 2, bw = (w - (bars.length - 1) * gap) / bars.length;
        bars.forEach((v, i) => {
            const x = i * (bw + gap), bh = v * h * 0.85, y = (h - bh) / 2;
            ctx.fillStyle = (i / bars.length) <= progress / 100
                ? (isSent ? 'rgba(255,255,255,0.9)' : 'var(--primary)')
                : (isSent ? 'rgba(255,255,255,0.25)' : 'rgba(150,150,150,0.2)');
            ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 1.5); ctx.fill();
        });
    }, [progress, isSent]);

    const toggle = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { }); }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 220 }}>
            <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: isSent ? 'rgba(255,255,255,0.2)' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: 24, cursor: 'pointer', borderRadius: 4 }} onClick={e => {
                    if (!audioRef.current) return;
                    const r = e.currentTarget.getBoundingClientRect();
                    audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * (audioRef.current.duration || 0);
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: isSent ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                    <span>{currentTime}</span><span>{duration}</span>
                </div>
            </div>
            <audio ref={audioRef} src={src} preload="metadata"
                onTimeUpdate={e => { setCurrentTime(fmt(e.currentTarget.currentTime)); setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100); }}
                onLoadedMetadata={e => { if (isFinite(e.currentTarget.duration)) setDuration(fmt(e.currentTarget.duration)); }}
                onEnded={() => { setIsPlaying(false); setProgress(100); }}
            />
        </div>
    );
};

/* ─── Emoji Data ─── */
const EMOJI_DATA: Record<string, string[]> = {
    Smileys: ['😀', '😂', '🥲', '😍', '🤩', '😎', '🤔', '😏', '🙄', '😴', '🤯', '🥳', '😡', '🤮', '👻', '💀'],
    Hands: ['👍', '👎', '👏', '🤝', '🙏', '✌️', '🤘', '💪', '👋', '🫡'],
    Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❤️‍🔥'],
    Objects: ['🔥', '⭐', '💯', '🎯', '🏆', '💡', '📌', '🔔', '⚡', '🚀'],
};
const QUICK_REACTIONS = ['❤️', '👍', '🔥', '😂', '😮', '😢'];

/* ─── Main Messages Page ─── */
export default function MessagesPage() {
    const { requireAuth } = useAuthGate();
    const { user: authUser, isLoggedIn } = useAuth();
    const { socket, onlineUsers, typingUsers, connected } = useSocket();
    const currentUser = authUser || { id: 'me', name: 'You', username: 'you', avatar: '' };

    // State
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [msgs, setMsgs] = useState<any[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgsLoading, setMsgsLoading] = useState(false);
    const [activeConv, setActiveConv] = useState<any>(null);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [commModal, setCommModal] = useState<{ user: User; type: 'call' | 'video' } | null>(null);

    // Compose
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [pendingFile, setPendingFile] = useState<{ name: string; type: string; preview: string; file: File } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const msgsEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Voice recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isHolding, setIsHolding] = useState(false);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Group
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [replyTo, setReplyTo] = useState<any>(null);

    // Info Panel & Actions
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ msg: any; x: number; y: number } | null>(null);
    const [editingMsg, setEditingMsg] = useState<any>(null);
    const [editContent, setEditContent] = useState('');
    const [addMemberSearch, setAddMemberSearch] = useState('');
    const [addMemberResults, setAddMemberResults] = useState<any[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [toast, setToast] = useState<string | null>(null);

    const fallbackUser: User = { id: 'fallback', name: 'User', username: 'user', avatar: '', bio: '', role: 'citizen', verified: false, followers: 0, following: 0, joined: '' };

    // Deduplicate participants by _id
    const dedupeParticipants = (convs: any[]) => convs.map(c => ({
        ...c,
        participants: c.participants?.filter((p: any, i: number, arr: any[]) =>
            arr.findIndex((x: any) => (x._id || x.id || x) === (p._id || p.id || p)) === i
        ) || []
    }));

    // ─── Toast helper ──
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

    // ─── Load Conversations ──
    const loadConversations = useCallback(async () => {
        try {
            const res = await fetch(`/api/messages?filter=${filter}`);
            const data = await res.json();
            if (data.conversations) {
                const seen = new Set<string>();
                const unique = data.conversations.filter((c: any) => {
                    const cid = c._id || c.id;
                    if (seen.has(cid)) return false;
                    seen.add(cid);
                    return true;
                });
                setConversations(dedupeParticipants(unique));
            }
        } catch { /* noop */ }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    // ─── Load Messages ──
    const loadMessages = useCallback(async (convId: string) => {
        setMsgsLoading(true);
        try {
            const res = await fetch(`/api/messages/${convId}`);
            const data = await res.json();
            if (data.messages) setMsgs(data.messages);
            if (data.conversation) {
                const conv = data.conversation;
                if (conv.participants) {
                    conv.participants = conv.participants.filter((p: any, i: number, arr: any[]) =>
                        arr.findIndex((x: any) => (x._id || x.id || x) === (p._id || p.id || p)) === i
                    );
                }
                setActiveConv(conv);
            }
        } catch { /* noop */ }
        finally { setMsgsLoading(false); }
    }, []);

    useEffect(() => {
        if (activeChat) {
            loadMessages(activeChat);
            socket?.emit('conversation:join', activeChat);
            return () => { socket?.emit('conversation:leave', activeChat); };
        }
    }, [activeChat, loadMessages, socket]);

    // Auto-scroll
    useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

    // ─── Socket.IO Real-Time ──
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = ({ message, conversationId }: any) => {
            if (conversationId === activeChat) {
                setMsgs(prev => {
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
            // Update conversation list
            setConversations(prev => prev.map(c => {
                if ((c._id || c.id) === conversationId) {
                    return { ...c, lastMessage: message.content || 'Media', unread: conversationId === activeChat ? 0 : (c.unread || 0) + 1 };
                }
                return c;
            }).sort((a, b) => (b.unread || 0) - (a.unread || 0)));
        };

        const handleNewConversation = ({ conversation }: any) => {
            setConversations(prev => {
                if (prev.some(c => (c._id || c.id) === (conversation._id || conversation.id))) return prev;
                return [conversation, ...prev];
            });
        };

        const handleConversationUpdated = ({ conversation }: any) => {
            setConversations(prev => prev.map(c => (c._id || c.id) === (conversation._id || conversation.id) ? { ...c, ...conversation } : c));
            if ((conversation._id || conversation.id) === activeChat) setActiveConv(conversation);
        };

        const handleReaction = ({ messageId, reactions }: any) => {
            setMsgs(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
        };

        socket.on('message:new', handleNewMessage);
        socket.on('conversation:new', handleNewConversation);
        socket.on('conversation:updated', handleConversationUpdated);
        socket.on('message:reaction', handleReaction);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('conversation:new', handleNewConversation);
            socket.off('conversation:updated', handleConversationUpdated);
            socket.off('message:reaction', handleReaction);
        };
    }, [socket, activeChat]);

    // ─── Send Message ──
    const sendMessage = async () => {
        if (!newMsg.trim() || !activeChat) return;
        try {
            const res = await fetch(`/api/messages/${activeChat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMsg, type: 'text', replyTo: replyTo?._id }),
            });
            const data = await res.json();
            if (data.message) {
                setMsgs(prev => [...prev, data.message]);
            }
            setNewMsg('');
            setReplyTo(null);
            socket?.emit('typing:stop', { conversationId: activeChat, userId: currentUser.id });
        } catch { /* noop */ }
    };

    // ─── Send File ──
    const sendFileMessage = async () => {
        if (!pendingFile || !activeChat) return;
        const msgType = pendingFile.type.startsWith('image/') ? 'image' : pendingFile.type.startsWith('video/') ? 'video' : 'file';
        try {
            const res = await fetch(`/api/messages/${activeChat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: pendingFile.name, type: msgType, mediaUrl: pendingFile.preview, mediaMimeType: pendingFile.type, fileName: pendingFile.name }),
            });
            const data = await res.json();
            if (data.message) setMsgs(prev => [...prev, data.message]);
            setPendingFile(null);
        } catch { /* noop */ }
    };

    // ─── File Select ──
    const handleFileSelect = (files: FileList | null) => {
        if (!files || !files[0]) return;
        const file = files[0];
        const preview = URL.createObjectURL(file);
        setPendingFile({ name: file.name, type: file.type, preview, file });
    };

    // ─── Typing ──
    const handleTyping = () => {
        if (!socket || !activeChat) return;
        socket.emit('typing:start', { conversationId: activeChat, userId: currentUser.id, userName: currentUser.name });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', { conversationId: activeChat, userId: currentUser.id });
        }, 2000);
    };

    // ─── Voice Recording ──
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mr = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                if (activeChat) {
                    try {
                        const res = await fetch(`/api/messages/${activeChat}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: '🎤 Voice message', type: 'voice', mediaUrl: url, voiceDuration: recordingTime }),
                        });
                        const data = await res.json();
                        if (data.message) setMsgs(prev => [...prev, data.message]);
                    } catch { /* noop */ }
                }
                setRecordingTime(0);
            };
            mediaRecorderRef.current = mr;
            mr.start();
            setIsRecording(true);
            recordingIntervalRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } catch { /* noop */ }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        setIsRecording(false);
    };

    const handleMicDown = () => {
        holdTimerRef.current = setTimeout(() => { setIsHolding(true); startRecording(); }, 300);
    };
    const handleMicUp = () => {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        if (isHolding || isRecording) { stopRecording(); setIsHolding(false); }
    };
    const handleMicLeave = handleMicUp;

    // ─── React to message ──
    const reactToMessage = async (messageId: string, emoji: string) => {
        try {
            await fetch(`/api/messages/${activeChat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _action: 'react', messageId, emoji }),
            });
        } catch { /* noop */ }
    };

    // ─── Create Group ──
    const createGroup = async () => {
        if (!groupName.trim()) return;
        try {
            const res = await fetch('/api/messages/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: groupName }),
            });
            const data = await res.json();
            if (data.conversation) {
                setConversations(prev => [data.conversation, ...prev]);
                setActiveChat(data.conversation._id || data.conversation.id);
            }
            setGroupName('');
            setShowCreateGroup(false);
            showToast('Group created!');
        } catch { /* noop */ }
    };

    // ─── Pin / Mute / Archive ──
    const togglePin = async () => {
        if (!activeChat) return;
        try { await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'pin' }) }); showToast('Chat pinned'); loadConversations(); } catch { /**/ }
    };
    const toggleMute = async () => {
        if (!activeChat) return;
        try { await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'mute' }) }); showToast('Notifications muted'); loadConversations(); } catch { /**/ }
    };
    const toggleArchive = async () => {
        if (!activeChat) return;
        try { await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'archive' }) }); showToast('Chat archived'); setActiveChat(null); setShowInfoPanel(false); loadConversations(); } catch { /**/ }
    };

    // ─── Group: Leave / Delete ──
    const leaveGroup = async () => {
        if (!activeChat) return;
        try {
            await fetch(`/api/messages/groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'leave', conversationId: activeChat }) });
            setActiveChat(null); setShowInfoPanel(false); setConfirmModal(null); showToast('You left the group'); loadConversations();
        } catch { /**/ }
    };
    const deleteGroup = async () => {
        if (!activeChat) return;
        try {
            await fetch(`/api/messages/groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', conversationId: activeChat }) });
            setActiveChat(null); setShowInfoPanel(false); setConfirmModal(null); showToast('Group deleted'); loadConversations();
        } catch { /**/ }
    };

    // ─── Block / Unblock ──
    const blockUser = async (userId: string) => {
        try {
            await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'block', userId }) });
            setBlockedUsers(prev => [...prev, userId]); setConfirmModal(null); showToast('User blocked');
        } catch { /**/ }
    };
    const unblockUser = async (userId: string) => {
        try {
            await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'unblock', userId }) });
            setBlockedUsers(prev => prev.filter(id => id !== userId)); showToast('User unblocked');
        } catch { /**/ }
    };

    // ─── Add / Remove Members ──
    const searchUsersForGroup = async (q: string) => {
        setAddMemberSearch(q);
        if (!q.trim()) { setAddMemberResults([]); return; }
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.results?.users) setAddMemberResults(data.results.users);
        } catch { /**/ }
    };
    const addMemberToGroup = async (userId: string) => {
        if (!activeChat) return;
        try {
            await fetch(`/api/messages/groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'addMember', conversationId: activeChat, userId }) });
            showToast('Member added'); setAddMemberSearch(''); setAddMemberResults([]); loadMessages(activeChat);
        } catch { /**/ }
    };
    const removeMemberFromGroup = async (userId: string) => {
        if (!activeChat) return;
        try {
            await fetch(`/api/messages/groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'removeMember', conversationId: activeChat, userId }) });
            showToast('Member removed'); setConfirmModal(null); loadMessages(activeChat);
        } catch { /**/ }
    };

    // ─── Edit / Delete Message ──
    const editMessage = async () => {
        if (!editingMsg || !editContent.trim()) return;
        try {
            await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'edit', messageId: editingMsg._id, content: editContent }) });
            setMsgs(prev => prev.map(m => m._id === editingMsg._id ? { ...m, content: editContent, edited: true } : m));
            setEditingMsg(null); setEditContent(''); showToast('Message edited');
        } catch { /**/ }
    };
    const deleteMessage = async (msgId: string) => {
        try {
            await fetch(`/api/messages/${activeChat}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', messageId: msgId }) });
            setMsgs(prev => prev.map(m => m._id === msgId ? { ...m, deleted: true, content: 'This message was deleted' } : m));
            setContextMenu(null); setConfirmModal(null); showToast('Message deleted');
        } catch { /**/ }
    };

    // ─── Back to chat list ──
    const goBackToList = () => { setActiveChat(null); setShowMobileChat(false); setShowInfoPanel(false); };

    const isAdmin = (conv: any) => conv?.admins?.some((a: any) => (a._id || a || '').toString() === currentUser.id?.toString());

    // ─── Helpers ──
    const getConvName = (conv: any) => {
        if (conv.type === 'group') return conv.name || 'Group';
        const other = conv.participants?.find((p: any) => (p._id || p.id) !== currentUser.id);
        return other?.name || 'Chat';
    };

    const getConvAvatar = (conv: any) => {
        if (conv.type === 'group') return conv.avatar || '';
        const other = conv.participants?.find((p: any) => (p._id || p.id) !== currentUser.id);
        return other?.avatar || '';
    };

    const getOtherUser = (conv: any): User => {
        if (!conv?.participants) return fallbackUser;
        const other = conv.participants.find((p: any) => (p._id || p.id) !== currentUser.id);
        return other ? { id: other._id || other.id, name: other.name, username: other.username, avatar: other.avatar, bio: '', role: other.role || 'citizen', verified: other.verified, followers: 0, following: 0, joined: '' } : fallbackUser;
    };

    const isOnline = (conv: any) => {
        if (conv.type === 'group') return conv.participants?.some((p: any) => onlineUsers.includes(p._id || p.id));
        const other = conv.participants?.find((p: any) => (p._id || p.id) !== currentUser.id);
        return other ? onlineUsers.includes(other._id || other.id) : false;
    };

    const getTypingText = () => {
        if (!activeChat) return null;
        const typers = typingUsers[activeChat];
        if (!typers?.length) return null;
        if (typers.length === 1) return `${typers[0].userName} is typing…`;
        return `${typers.length} people are typing…`;
    };

    const isSentByMe = (msg: any) => (msg.sender?._id || msg.sender?.id || msg.sender) === currentUser.id;

    const filteredConvs = conversations.filter(c => {
        if (!searchQuery) return true;
        return getConvName(c).toLowerCase().includes(searchQuery.toLowerCase());
    }).filter((c, i, arr) => {
        const cid = c._id || c.id;
        return arr.findIndex(x => (x._id || x.id) === cid) === i;
    });

    // ─── RENDER ──
    return (
        <div className="messages-page" style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
            {/* ═══ LEFT SIDEBAR ═══ */}
            <div className={`messages-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`} style={{ width: 360, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                {/* Header */}
                <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Messages</h2>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-icon btn-sm" onClick={() => setShowCreateGroup(true)} title="New Group" style={{ background: 'var(--bg-secondary)', borderRadius: 10 }}>
                                <UsersIcon size={16} />
                            </button>
                            <button className="btn btn-icon btn-sm" title="New Chat" style={{ background: 'var(--bg-secondary)', borderRadius: 10 }}>
                                <PenIcon size={16} />
                            </button>
                        </div>
                    </div>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', display: 'flex' }}>
                            <SearchIcon size={16} />
                        </div>
                        <input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '0.82rem', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        {(['all', 'unread', 'groups'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === f ? 'var(--primary)' : 'var(--bg-secondary)', color: filter === f ? '#fff' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading...</div>
                    ) : filteredConvs.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No conversations yet</div>
                    ) : filteredConvs.map((conv, idx) => {
                        const id = conv._id || conv.id;
                        const isActive = id === activeChat;
                        const online = isOnline(conv);
                        return (
                            <div key={`${id}-${idx}`} onClick={() => { setActiveChat(id); setShowMobileChat(true); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: isActive ? 'var(--bg-secondary)' : 'transparent', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.15s' }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ position: 'relative' }}>
                                    {conv.type === 'group' ? (
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                                            {(conv.name || 'G')[0].toUpperCase()}
                                        </div>
                                    ) : (
                                        <UserAvatar name={getConvName(conv)} avatar={getConvAvatar(conv)} size="md" />
                                    )}
                                    {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-primary)' }} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getConvName(conv)}</span>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{conv.lastMessage || 'No messages yet'}</span>
                                        {(conv.unread || 0) > 0 && (
                                            <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                                                {conv.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Connection Status */}
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{connected ? 'Connected' : 'Reconnecting...'}</span>
                </div>
            </div>

            {/* ═══ RIGHT: CHAT VIEW ═══ */}
            <div className={`messages-chat-view ${!showMobileChat ? 'mobile-hidden-chat' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                {activeChat && activeConv ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button className="btn btn-icon btn-sm" style={{ background: 'var(--bg-secondary)', borderRadius: 10 }} onClick={goBackToList}>
                                    <ArrowLeftIcon size={18} />
                                </button>
                                <div style={{ position: 'relative' }}>
                                    {activeConv.type === 'group' ? (
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                            {(activeConv.name || 'G')[0].toUpperCase()}
                                        </div>
                                    ) : (
                                        <UserAvatar name={getConvName(activeConv)} avatar={getConvAvatar(activeConv)} />
                                    )}
                                    {isOnline(activeConv) && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-primary)' }} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{getConvName(activeConv)}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                                        {getTypingText() || (isOnline(activeConv) ? 'Online' : activeConv.type === 'group' ? `${activeConv.participants?.length || 0} members` : 'Offline')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-icon btn-sm" style={{ background: 'var(--bg-secondary)', borderRadius: 10 }} onClick={() => { const u = getOtherUser(activeConv); setCommModal({ user: u, type: 'call' }); }}>
                                    <PhoneIcon size={16} />
                                </button>
                                <button className="btn btn-icon btn-sm" style={{ background: 'var(--bg-secondary)', borderRadius: 10 }} onClick={() => { const u = getOtherUser(activeConv); setCommModal({ user: u, type: 'video' }); }}>
                                    <VideoIcon size={16} />
                                </button>
                                <button className="btn btn-icon btn-sm" style={{ background: showInfoPanel ? 'var(--primary)' : 'var(--bg-secondary)', color: showInfoPanel ? '#fff' : 'inherit', borderRadius: 10 }} onClick={() => setShowInfoPanel(!showInfoPanel)}>
                                    <InfoIcon size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="messages-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {msgsLoading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Loading messages...</div>
                            ) : msgs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No messages yet. Say hi! 👋</div>
                            ) : msgs.map((msg, i) => {
                                const sent = isSentByMe(msg);
                                const isSystem = msg.type === 'system';
                                const showSender = !sent && activeConv.type === 'group' && msg.type !== 'system';
                                const prevMsg = msgs[i - 1];
                                const showTime = !prevMsg || new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000;

                                if (isSystem) {
                                    return (
                                        <div key={msg._id || i} style={{ textAlign: 'center', padding: '8px 0' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20 }}>
                                                {msg.sender?.name || 'System'} {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg._id || i}>
                                        {showTime && (
                                            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                                {new Date(msg.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: sent ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                                            {!sent && showSender && <UserAvatar name={msg.sender?.name || '?'} avatar={msg.sender?.avatar} size="sm" />}
                                            <div className="msg-bubble-wrap" style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: sent ? 'flex-end' : 'flex-start' }}>
                                                {showSender && <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 2, marginLeft: 8 }}>{msg.sender?.name}</span>}
                                                
                                                {/* Reply preview */}
                                                {msg.replyTo && (
                                                    <div style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '8px 8px 0 0', background: sent ? 'rgba(99,91,255,0.15)' : 'var(--bg-tertiary)', borderLeft: '2px solid var(--primary)', color: 'var(--text-tertiary)', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        ↩ {msg.replyTo.content?.substring(0, 50)}
                                                    </div>
                                                )}

                                                {/* Message Bubble */}
                                                <div
                                                    style={{
                                                        padding: msg.type === 'voice' ? '8px 12px' : '8px 14px',
                                                        borderRadius: sent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                        background: sent ? 'var(--primary)' : 'var(--bg-secondary)',
                                                        color: sent ? '#fff' : 'var(--text-primary)',
                                                        fontSize: '0.88rem',
                                                        lineHeight: 1.45,
                                                        wordBreak: 'break-word',
                                                        position: 'relative',
                                                    }}
                                                    onDoubleClick={() => reactToMessage(msg._id, '❤️')}
                                                    onContextMenu={e => { e.preventDefault(); setContextMenu({ msg, x: e.clientX, y: e.clientY }); }}
                                                >
                                                    {msg.deleted ? (
                                                        <span style={{ fontStyle: 'italic', opacity: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}><XIcon size={12} /> This message was deleted</span>
                                                    ) : msg.type === 'voice' ? (
                                                        <VoicePlayer src={msg.mediaUrl || ''} isSent={sent} />
                                                    ) : msg.type === 'image' ? (
                                                        <img src={msg.mediaUrl} alt="" style={{ maxWidth: 240, borderRadius: 8 }} />
                                                    ) : (
                                                        msg.content
                                                    )}
                                                    {/* Status */}
                                                    {sent && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', marginTop: 2, fontSize: '0.58rem', opacity: 0.7 }}>
                                                            {msg.edited && <span style={{ marginRight: 3 }}>edited</span>}
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {msg.status === 'seen' ? <span style={{ marginLeft: 2 }}>✓✓</span> : msg.status === 'delivered' ? <span style={{ marginLeft: 2 }}>✓✓</span> : <span style={{ marginLeft: 2 }}>✓</span>}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Reactions */}
                                                {msg.reactions?.length > 0 && (
                                                    <div style={{ display: 'flex', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
                                                        {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                                                            const count = msg.reactions.filter((r: any) => r.emoji === emoji).length;
                                                            return (
                                                                <span key={emoji} style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
                                                                    onClick={() => reactToMessage(msg._id, emoji)}>
                                                                    {emoji} {count > 1 ? count : ''}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing Indicator */}
                            {getTypingText() && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', animation: `typing-dot 1.4s infinite ${i * 0.2}s` }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{getTypingText()}</span>
                                </div>
                            )}
                            <div ref={msgsEndRef} />
                        </div>

                        {/* Recording Overlay */}
                        {isRecording && (
                            <div style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <button className="btn btn-sm" onClick={stopRecording} style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontWeight: 600, border: 'none', padding: '6px 16px' }}>Stop & Send</button>
                            </div>
                        )}

                        {/* Reply Preview */}
                        {replyTo && (
                            <div style={{ padding: '8px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                                    <div style={{ width: 3, height: 20, borderRadius: 2, background: 'var(--primary)' }} />
                                    <span>Replying to <strong style={{ color: 'var(--text-primary)' }}>{replyTo.sender?.name}</strong>: {replyTo.content?.substring(0, 40)}...</span>
                                </div>
                                <button className="btn btn-icon btn-sm" onClick={() => setReplyTo(null)}><XIcon size={14} /></button>
                            </div>
                        )}

                        {/* Input */}
                        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary)' }}>
                            {/* Emoji */}
                            <div style={{ position: 'relative' }}>
                                <button className="btn btn-icon" style={{ color: 'var(--text-tertiary)' }} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <SmileIcon size={20} />
                                </button>
                                {showEmojiPicker && (
                                    <div style={{ position: 'absolute', bottom: 48, left: 0, width: 280, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden' }}>
                                        <div style={{ overflowY: 'auto', maxHeight: 240, padding: 10 }}>
                                            {Object.entries(EMOJI_DATA).map(([cat, emojis]) => (
                                                <div key={cat} style={{ marginBottom: 8 }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase' }}>{cat}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                        {emojis.map(e => (
                                                            <button key={e} onClick={() => { setNewMsg(p => p + e); setShowEmojiPicker(false); }}
                                                                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '1.15rem' }}>
                                                                {e}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* File */}
                            <input type="file" ref={fileInputRef} hidden onChange={e => { handleFileSelect(e.target.files); e.target.value = ''; }} />
                            <button className="btn btn-icon" style={{ color: 'var(--text-tertiary)' }} onClick={() => requireAuth(() => fileInputRef.current?.click())}>
                                <PaperclipIcon size={20} />
                            </button>

                            {/* Pending File */}
                            {pendingFile ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 20, padding: '6px 12px', minWidth: 0 }}>
                                    {pendingFile.type.startsWith('image/') && pendingFile.preview ? (
                                        <img src={pendingFile.preview} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                                    ) : (
                                        <PaperclipIcon size={16} />
                                    )}
                                    <span style={{ flex: 1, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</span>
                                    <button className="btn btn-icon btn-sm" onClick={() => setPendingFile(null)}><XIcon size={14} /></button>
                                    <button onClick={() => requireAuth(() => sendFileMessage())} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <SendIcon size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        placeholder={isLoggedIn ? 'Type a message...' : 'Sign in to send messages'}
                                        value={newMsg}
                                        onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); requireAuth(() => sendMessage()); } }}
                                        style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none' }}
                                    />
                                    {newMsg.trim() ? (
                                        <button onClick={() => requireAuth(() => sendMessage())} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                            <SendIcon size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            style={{ width: 38, height: 38, borderRadius: '50%', background: isHolding ? 'var(--primary)' : 'var(--bg-secondary)', color: isHolding ? '#fff' : 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', boxShadow: isHolding ? '0 0 0 4px rgba(99,91,255,0.2)' : 'none' }}
                                            onMouseDown={handleMicDown} onMouseUp={handleMicUp} onMouseLeave={handleMicLeave}
                                            onTouchStart={handleMicDown} onTouchEnd={handleMicUp}
                                            title="Hold to record"
                                        >
                                            <MicIcon size={20} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', gap: 12 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SendIcon size={28} />
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select a conversation</span>
                        <span style={{ fontSize: '0.85rem' }}>Choose a chat from the sidebar to start messaging</span>
                    </div>
                )}
            </div>

            {/* ═══ Create Group Modal ═══ */}
            {showCreateGroup && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setShowCreateGroup(false)}>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 16px 40px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px' }}>Create Group</h3>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Group Name</label>
                            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Enter group name..."
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                            <button className="btn" onClick={() => setShowCreateGroup(false)} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg-secondary)', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={createGroup} disabled={!groupName.trim()} style={{ padding: '8px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600 }}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Communication Modal ═══ */}
            {commModal && <CommunicationModal user={commModal.user} type={commModal.type} onClose={() => setCommModal(null)} />}

            {/* ═══ Info / Settings Panel ═══ */}
            {showInfoPanel && activeConv && (
                <div className="messages-info-panel" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)', zIndex: 9998, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.08)', animation: 'slideInRight 0.2s ease' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{activeConv.type === 'group' ? 'Group Info' : 'Chat Info'}</h3>
                        <button className="btn btn-icon btn-sm" onClick={() => setShowInfoPanel(false)} style={{ background: 'var(--bg-secondary)', borderRadius: 10 }}><XIcon size={16} /></button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                        {/* Avatar */}
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            {activeConv.type === 'group' ? (
                                <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem', margin: '0 auto 8px' }}>{(activeConv.name || 'G')[0]}</div>
                            ) : (
                                <div style={{ margin: '0 auto 8px', width: 64 }}><UserAvatar name={getConvName(activeConv)} avatar={getConvAvatar(activeConv)} size="lg" /></div>
                            )}
                            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{getConvName(activeConv)}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{activeConv.type === 'group' ? `${activeConv.participants?.length || 0} members` : isOnline(activeConv) ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Online</> : <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6b7280', display: 'inline-block' }} /> Offline</>}</div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                            <button onClick={togglePin} style={{ padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><PinIcon size={14} /> Pin</button>
                            <button onClick={toggleMute} style={{ padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><BellOffIcon size={14} /> Mute</button>
                            <button onClick={toggleArchive} style={{ padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><ArchiveIcon size={14} /> Archive</button>
                            {activeConv.type === 'dm' && (() => { const other = getOtherUser(activeConv); const isBlocked = blockedUsers.includes(other.id); return (
                                <button onClick={() => isBlocked ? unblockUser(other.id) : setConfirmModal({ title: 'Block User', message: `Block ${other.name}? They won't be able to message or call you.`, onConfirm: () => blockUser(other.id) })}
                                    style={{ padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: isBlocked ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: isBlocked ? '#ef4444' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{isBlocked ? <><ShieldOffIcon size={14} /> Unblock</> : <><ShieldIcon size={14} /> Block</>}</button>
                            ); })()}
                        </div>

                        {/* Members (group only) */}
                        {activeConv.type === 'group' && (
                            <>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Members</div>
                                {isAdmin(activeConv) && (
                                    <div style={{ marginBottom: 12 }}>
                                        <input placeholder="Search users to add..." value={addMemberSearch} onChange={e => searchUsersForGroup(e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none', marginBottom: 4 }} />
                                        {addMemberResults.map((u: any) => (
                                            <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <UserAvatar name={u.name} avatar={u.avatar} size="sm" />
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{u.name}</span>
                                                </div>
                                                <button onClick={() => addMemberToGroup(u._id)} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeConv.participants?.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => (x._id || x.id || x) === (p._id || p.id || p)) === i).map((p: any) => {
                                    const pid = p._id || p.id;
                                    const pIsAdmin = activeConv.admins?.some((a: any) => (a._id || a || '').toString() === pid?.toString());
                                    return (
                                        <div key={pid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <UserAvatar name={p.name} avatar={p.avatar} size="sm" />
                                                <div>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.62rem', color: pIsAdmin ? 'var(--primary)' : 'var(--text-tertiary)' }}>{pIsAdmin ? 'Admin' : 'Member'}</div>
                                                </div>
                                            </div>
                                            {isAdmin(activeConv) && pid !== currentUser.id && (
                                                <button onClick={() => setConfirmModal({ title: 'Remove Member', message: `Remove ${p.name} from the group?`, onConfirm: () => removeMemberFromGroup(pid) })}
                                                    style={{ padding: '4px 8px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {/* Group Actions */}
                        {activeConv.type === 'group' && (
                            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button onClick={() => setConfirmModal({ title: 'Leave Group', message: 'Are you sure you want to leave this group?', onConfirm: leaveGroup })}
                                    style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}><LogOutIcon size={14} /> Leave Group</button>
                                {isAdmin(activeConv) && (
                                    <button onClick={() => setConfirmModal({ title: 'Delete Group', message: 'This will permanently delete the group and all messages. Are you sure?', onConfirm: deleteGroup })}
                                        style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}><TrashIcon size={14} /> Delete Group</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ Message Context Menu ═══ */}
            {contextMenu && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }} onClick={() => setContextMenu(null)}>
                    <div style={{ position: 'absolute', top: contextMenu.y, left: contextMenu.x, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 6, minWidth: 160 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setReplyTo(contextMenu.msg); setContextMenu(null); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textAlign: 'left', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}><ReplyIcon size={14} /> Reply</button>
                        {isSentByMe(contextMenu.msg) && !contextMenu.msg.deleted && (
                            <>
                                <button onClick={() => { setEditingMsg(contextMenu.msg); setEditContent(contextMenu.msg.content); setContextMenu(null); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textAlign: 'left', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}><EditIcon size={14} /> Edit</button>
                                <button onClick={() => setConfirmModal({ title: 'Delete Message', message: 'Delete this message? This cannot be undone.', onConfirm: () => deleteMessage(contextMenu.msg._id) })} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textAlign: 'left', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}><TrashIcon size={14} /> Delete</button>
                            </>
                        )}
                        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0', padding: '4px 0' }}>
                            <div style={{ display: 'flex', gap: 2, padding: '4px 8px' }}>
                                {QUICK_REACTIONS.map(emoji => (
                                    <button key={emoji} onClick={() => { reactToMessage(contextMenu.msg._id, emoji); setContextMenu(null); }}
                                        style={{ width: 30, height: 30, border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>{emoji}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Edit Message Modal ═══ */}
            {editingMsg && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditingMsg(null)}>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>Edit Message</h3>
                        <input value={editContent} onChange={e => setEditContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') editMessage(); }}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none' }} autoFocus />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            <button onClick={() => setEditingMsg(null)} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg-secondary)', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={editMessage} style={{ padding: '8px 20px', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Confirmation Modal ═══ */}
            {confirmModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setConfirmModal(null)}>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangleIcon size={18} /> {confirmModal.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={() => setConfirmModal(null)} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg-secondary)', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={confirmModal.onConfirm} style={{ padding: '8px 20px', borderRadius: 10, background: '#ef4444', color: '#fff', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Toast Notification ═══ */}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '10px 24px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, zIndex: 10001, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.25s ease' }}>
                    {toast}
                </div>
            )}

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes typing-dot {
                    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
                    30% { opacity: 1; transform: translateY(-3px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translate(-50%, 10px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }

                /* ═══ MOBILE RESPONSIVENESS ═══ */
                @media (max-width: 768px) {
                    .messages-page {
                        height: calc(100vh - 56px) !important;
                        height: calc(100dvh - 56px) !important;
                    }

                    /* Sidebar: full width on mobile */
                    .messages-sidebar {
                        width: 100% !important;
                        border-right: none !important;
                    }
                    .messages-sidebar.mobile-hidden {
                        display: none !important;
                    }

                    /* Chat view: full width on mobile, hidden when sidebar is showing */
                    .messages-chat-view {
                        width: 100%;
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 10;
                    }
                    .messages-chat-view.mobile-hidden-chat {
                        display: none !important;
                    }

                    /* Chat body padding */
                    .messages-body {
                        padding: 12px 12px !important;
                    }

                    /* Message bubbles: wider on mobile */
                    .msg-bubble-wrap {
                        max-width: 85% !important;
                    }

                    /* Info panel: full screen on mobile */
                    .messages-info-panel {
                        width: 100% !important;
                        left: 0 !important;
                    }
                }

                /* ═══ SMALL MOBILE (< 400px) ═══ */
                @media (max-width: 400px) {
                    .messages-body {
                        padding: 8px 8px !important;
                    }
                    .msg-bubble-wrap {
                        max-width: 90% !important;
                    }
                }
            `}</style>
        </div>
    );
}
