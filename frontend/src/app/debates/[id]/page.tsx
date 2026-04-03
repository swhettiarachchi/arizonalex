'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/components/providers/SocketProvider';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
    ArrowLeftIcon, SwordsIcon, SendIcon, EyeIcon,
    TrophyIcon, TimerIcon, CheckCircleIcon, ZapIcon
} from '@/components/ui/Icons';
import type { Debate, DebateMessage } from '@/lib/types';

function DebateTimerDisplay({ debate }: { debate: Debate }) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const calcRemaining = () => {
            if (debate.status === 'live' && debate.startedAt) {
                const end = new Date(debate.startedAt).getTime() + debate.duration * 60000;
                return Math.max(0, Math.floor((end - Date.now()) / 1000));
            }
            if (debate.status === 'voting' && debate.votingDeadline) {
                return Math.max(0, Math.floor((new Date(debate.votingDeadline).getTime() - Date.now()) / 1000));
            }
            return 0;
        };
        setRemaining(calcRemaining());
        const interval = setInterval(() => setRemaining(calcRemaining()), 1000);
        return () => clearInterval(interval);
    }, [debate]);

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const isUrgent = remaining < 60 && remaining > 0;

    return (
        <div className={`debate-room-timer ${isUrgent ? 'urgent' : ''}`}>
            <TimerIcon size={18} />
            <span className="timer-value">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
            <span className="timer-label">
                {debate.status === 'live' ? 'Debate ends in' : debate.status === 'voting' ? 'Voting ends in' : ''}
            </span>
        </div>
    );
}

function VotingPanel({ debate, onVote }: { debate: Debate; onVote: () => void }) {
    const [voting, setVoting] = useState(false);
    const [voted, setVoted] = useState(debate.userVote?.voted || false);
    const [votedFor, setVotedFor] = useState(debate.userVote?.votedFor || '');

    const creatorId = debate.creator?._id || (debate.creator as unknown as string);
    const opponentId = debate.opponent?._id || (debate.opponent as unknown as string);
    const creatorVotes = debate.voteCounts?.[creatorId] || 0;
    const opponentVotes = debate.voteCounts?.[opponentId] || 0;
    const totalVotes = (debate.totalVotes || 0) || (creatorVotes + opponentVotes);
    const creatorPct = totalVotes > 0 ? Math.round((creatorVotes / totalVotes) * 100) : 50;
    const opponentPct = totalVotes > 0 ? Math.round((opponentVotes / totalVotes) * 100) : 50;

    const castVote = async (userId: string) => {
        if (voted || voting) return;
        setVoting(true);
        try {
            const res = await fetch(`/api/debates/${debate._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ votedFor: userId }),
            });
            const data = await res.json();
            if (data.success) { setVoted(true); setVotedFor(userId); onVote(); }
        } catch (err) { console.error('Vote failed:', err); }
        finally { setVoting(false); }
    };

    return (
        <div className="voting-panel fade-in">
            <h3 className="voting-title"><TrophyIcon size={20} /> Vote for the Winner</h3>
            <p className="voting-subtitle">{voted ? 'Your vote has been locked!' : 'Cast your vote — one vote per user, no changes after submission'}</p>
            <div className="voting-candidates">
                <button className={`voting-candidate ${votedFor === creatorId ? 'voted' : ''} ${voted && votedFor !== creatorId ? 'not-voted' : ''}`}
                    onClick={() => castVote(creatorId)} disabled={voted || voting} id="vote-creator">
                    <UserAvatar name={debate.creator?.name || ''} avatar={debate.creator?.avatar} size="lg" />
                    <span className="voting-candidate-name">{debate.creator?.name || 'Creator'}</span>
                    <div className="voting-bar-wrap"><div className="voting-bar" style={{ width: `${creatorPct}%` }} /></div>
                    <span className="voting-count">{creatorVotes} votes ({creatorPct}%)</span>
                    {voted && votedFor === creatorId && <CheckCircleIcon size={20} className="vote-check" />}
                </button>
                <div className="voting-vs">VS</div>
                <button className={`voting-candidate ${votedFor === opponentId ? 'voted' : ''} ${voted && votedFor !== opponentId ? 'not-voted' : ''}`}
                    onClick={() => castVote(opponentId)} disabled={voted || voting} id="vote-opponent">
                    <UserAvatar name={debate.opponent?.name || ''} avatar={debate.opponent?.avatar} size="lg" />
                    <span className="voting-candidate-name">{debate.opponent?.name || 'Opponent'}</span>
                    <div className="voting-bar-wrap"><div className="voting-bar opponent" style={{ width: `${opponentPct}%` }} /></div>
                    <span className="voting-count">{opponentVotes} votes ({opponentPct}%)</span>
                    {voted && votedFor === opponentId && <CheckCircleIcon size={20} className="vote-check" />}
                </button>
            </div>
            <div className="voting-total">Total votes: {totalVotes}</div>
        </div>
    );
}

export default function DebateRoomPage() {
    const params = useParams();
    const debateId = params.id as string;
    const { user, isLoggedIn } = useAuth();
    const { socket } = useSocket();
    const [debate, setDebate] = useState<Debate | null>(null);
    const [messages, setMessages] = useState<DebateMessage[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [joining, setJoining] = useState(false);
    const [starting, setStarting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchDebate = useCallback(async () => {
        try {
            const res = await fetch(`/api/debates/${debateId}`);
            const data = await res.json();
            if (data.success) { setDebate(data.data); setMessages(data.data.messages || []); }
        } catch (err) { console.error('Failed to fetch debate:', err); }
        finally { setLoading(false); }
    }, [debateId]);

    useEffect(() => { fetchDebate(); }, [fetchDebate]);

    useEffect(() => {
        if (!socket || !debateId) return;
        socket.emit('debate:join', debateId);
        return () => { socket.emit('debate:leave', debateId); };
    }, [socket, debateId]);

    useEffect(() => {
        if (!socket) return;
        const handleMessage = (payload: any) => {
            const { debateId: dId, message } = payload;
            if (dId === debateId) setMessages(prev => [...prev, message]);
        };
        const handleVoteUpdate = (payload: any) => {
            const { debateId: dId, voteCounts, totalVotes } = payload;
            if (dId === debateId) setDebate(prev => prev ? { ...prev, voteCounts, totalVotes } : prev);
        };
        const handleStatus = (updated: any) => {
            if (updated._id === debateId) setDebate(prev => prev ? { ...prev, ...updated } : updated);
        };
        const handleResult = (payload: any) => {
            const rd = payload.debate || payload;
            if (rd._id === debateId) setDebate(prev => prev ? { ...prev, ...rd } : rd);
        };
        socket.on('debate:message', handleMessage);
        socket.on('debate:vote_update', handleVoteUpdate);
        socket.on('debate:go_live', handleStatus);
        socket.on('debate:voting_started', handleStatus);
        socket.on('debate:result', handleResult);
        return () => {
            socket.off('debate:message', handleMessage);
            socket.off('debate:vote_update', handleVoteUpdate);
            socket.off('debate:go_live', handleStatus);
            socket.off('debate:voting_started', handleStatus);
            socket.off('debate:result', handleResult);
        };
    }, [socket, debateId]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const userId = user?.id;
    const isCreator = userId && debate && userId === (debate.creator?._id || (debate.creator as unknown as string));
    const isOpponent = userId && debate && debate.opponent && userId === (debate.opponent?._id || (debate.opponent as unknown as string));
    const isParticipant = isCreator || isOpponent;

    const sendMessage = async () => {
        if (!newMsg.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/api/debates/${debateId}/message`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMsg.trim() }),
            });
            const data = await res.json();
            if (data.success) setNewMsg('');
        } catch (err) { console.error('Send failed:', err); }
        finally { setSending(false); }
    };

    const joinDebate = async () => {
        if (joining) return;
        setJoining(true);
        try {
            const res = await fetch(`/api/debates/${debateId}/join`, { method: 'POST' });
            const data = await res.json();
            if (data.success) setDebate(data.data); else alert(data.message);
        } catch (err) { console.error('Join failed:', err); }
        finally { setJoining(false); }
    };

    const startDebateAction = async () => {
        if (starting) return;
        setStarting(true);
        try {
            const res = await fetch(`/api/debates/${debateId}/start`, { method: 'POST' });
            const data = await res.json();
            if (data.success) setDebate(data.data); else alert(data.message);
        } catch (err) { console.error('Start failed:', err); }
        finally { setStarting(false); }
    };

    if (loading) return (
        <div className="page-container"><div className="feed-column"><div className="debate-room-loading"><div className="debate-spinner large" /><p>Loading debate room...</p></div></div></div>
    );
    if (!debate) return (
        <div className="page-container"><div className="feed-column"><div className="debate-empty"><SwordsIcon size={48} /><h3>Debate not found</h3><Link href="/debates" className="btn btn-primary">Back to Debates</Link></div></div></div>
    );

    const statusColors: Record<string, string> = { waiting: '#f59e0b', live: '#ef4444', voting: '#8b5cf6', completed: '#10b981', cancelled: '#6b7280' };

    return (
        <div className="page-container">
            <div className="feed-column debate-room-column">
                <div className="debate-room-header">
                    <div className="debate-room-header-left">
                        <Link href="/debates" className="page-back-btn"><ArrowLeftIcon size={20} /></Link>
                        <div>
                            <h1 className="debate-room-title">{debate.title}</h1>
                            <div className="debate-room-meta-row">
                                <span className="debate-room-status" style={{ background: statusColors[debate.status] }}>
                                    {debate.status === 'live' && <span className="live-pulse" />}{debate.status.toUpperCase()}
                                </span>
                                <span className="debate-room-category">{debate.category}</span>
                                <span className="debate-room-prize"><TrophyIcon size={14} /> ${debate.prizePool} prize</span>
                            </div>
                        </div>
                    </div>
                    {(debate.status === 'live' || debate.status === 'voting') && <DebateTimerDisplay debate={debate} />}
                </div>

                <div className="debate-room-topic"><ZapIcon size={16} /><span>{debate.topic}</span></div>

                <div className="debate-room-participants">
                    <div className="debate-room-participant creator">
                        <UserAvatar name={debate.creator?.name || ''} avatar={debate.creator?.avatar} size="md" />
                        <div className="participant-info"><span className="participant-name">{debate.creator?.name}</span><span className="participant-role">Creator</span></div>
                    </div>
                    <div className="debate-room-vs"><SwordsIcon size={24} /><span>VS</span></div>
                    <div className="debate-room-participant opponent">
                        {debate.opponent ? (
                            <><UserAvatar name={debate.opponent.name} avatar={debate.opponent.avatar} size="md" />
                            <div className="participant-info"><span className="participant-name">{debate.opponent.name}</span><span className="participant-role">Challenger</span></div></>
                        ) : (
                            <div className="waiting-opponent-slot"><div className="waiting-avatar large">?</div><span>Waiting for opponent...</span></div>
                        )}
                    </div>
                </div>

                {debate.status === 'waiting' && !isParticipant && isLoggedIn && (
                    <button className="btn btn-primary btn-lg debate-join-btn" onClick={joinDebate} disabled={joining} id="join-debate">
                        {joining ? <span className="debate-spinner" /> : <><SwordsIcon size={20} /> Join Debate &mdash; ${debate.entryFee} Entry</>}
                    </button>
                )}
                {debate.status === 'waiting' && isCreator && debate.opponent && (
                    <button className="btn btn-primary btn-lg debate-start-btn" onClick={startDebateAction} disabled={starting} id="start-debate">
                        {starting ? <span className="debate-spinner" /> : <><ZapIcon size={20} /> Start Debate Now</>}
                    </button>
                )}
                {debate.status === 'waiting' && isCreator && !debate.opponent && (
                    <div className="debate-waiting-banner"><div className="debate-spinner" /><span>Waiting for an opponent to join...</span><span className="debate-waiting-hint">Share this debate link to get a challenger</span></div>
                )}

                {debate.status === 'voting' && <VotingPanel debate={debate} onVote={fetchDebate} />}

                {debate.status === 'completed' && (
                    <div className="debate-result-banner fade-in">
                        {debate.isDraw ? (
                            <><TrophyIcon size={28} /><h3>It&apos;s a Draw!</h3><p>Both debaters performed equally. Prize pool split evenly.</p></>
                        ) : debate.winner ? (
                            <><TrophyIcon size={28} /><h3>{debate.winner.name} Wins!</h3><p>Won ${Math.round(debate.prizePool * 0.9)} from the ${debate.prizePool} prize pool</p><UserAvatar name={debate.winner.name} avatar={debate.winner.avatar} size="lg" /></>
                        ) : null}
                        {debate.totalVotes != null && <p className="result-votes">Total votes cast: {debate.totalVotes}</p>}
                    </div>
                )}

                <div className="debate-room-chat">
                    <div className="debate-chat-header">
                        <span>{debate.status === 'live' ? 'Live Debate' : 'Debate Chat'}</span>
                        <span className="debate-chat-count">{messages.length} messages</span>
                    </div>
                    <div className="debate-chat-messages">
                        {messages.length === 0 ? (
                            <div className="debate-chat-empty"><SwordsIcon size={32} /><p>{debate.status === 'waiting' ? "Debate hasn't started yet" : 'No messages yet'}</p></div>
                        ) : messages.map((msg, i) => {
                            const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                            const senderName = typeof msg.sender === 'object' ? msg.sender.name : 'Unknown';
                            const senderAvatar = typeof msg.sender === 'object' ? msg.sender.avatar : '';
                            const isCreatorMsg = senderId === debate.creator?._id;
                            return (
                                <div key={msg._id || i} className={`debate-msg ${isCreatorMsg ? 'creator-msg' : 'opponent-msg'}`}>
                                    <UserAvatar name={senderName} avatar={senderAvatar} size="sm" />
                                    <div className="debate-msg-content">
                                        <span className="debate-msg-author">{senderName}</span>
                                        <p className="debate-msg-text">{msg.content}</p>
                                        <span className="debate-msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    {debate.status === 'live' && isParticipant && (
                        <div className="debate-chat-input-bar">
                            <input type="text" className="debate-chat-input" placeholder="Make your argument..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} maxLength={2000} id="debate-message-input" />
                            <button className="debate-chat-send" onClick={sendMessage} disabled={!newMsg.trim() || sending} id="debate-send-btn"><SendIcon size={18} /></button>
                        </div>
                    )}
                </div>

                <div className="debate-spectator-bar">
                    <EyeIcon size={16} /><span>{debate.spectatorCount || 0} spectators watching</span>
                    <span className="debate-view-count">{debate.viewCount} total views</span>
                </div>
            </div>
        </div>
    );
}
