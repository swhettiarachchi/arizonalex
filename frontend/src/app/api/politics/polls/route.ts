import { NextResponse, NextRequest } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const user = getUserFromCookies(token);

    try {
        const res = await fetch(`${API_BASE}/polls`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const data = await res.json();

        if (!res.ok) throw new Error('Backend returned error');

        // Map backend _id to frontend id, and set user's voted option index
        const polls = data.polls.map((p: any) => {
            let votedIndex = undefined;
            if (req.cookies.get('user-id')?.value) {
                const uid = req.cookies.get('user-id')?.value;
                p.options.forEach((opt: any, idx: number) => {
                    if (opt.votes && opt.votes.includes(uid)) {
                        votedIndex = idx;
                    }
                });
            }

            return {
                ...p,
                id: p._id,
                voted: votedIndex,
                options: p.options.map((o: any) => ({ ...o, votes: Array.isArray(o.votes) ? o.votes.length : 0 }))
            };
        });

        return NextResponse.json({ polls });
    } catch (e) {
        console.warn('Backend unreachable for polls, using in-memory store');
        // Fallback to in-memory store
        const polls = store.polls.map(p => {
            const votedIdx = user ? p.userVotes[user.id] : undefined;
            return {
                id: p.id,
                question: p.question,
                options: p.options.map((o, idx) => ({
                    label: o.label,
                    votes: o.votes + Object.values(p.userVotes).filter(v => v === idx).length
                })),
                totalVotes: p.totalVotes + Object.keys(p.userVotes).length,
                endDate: p.endDate,
                author: p.author,
                voted: votedIdx !== undefined ? votedIdx : undefined
            };
        });
        return NextResponse.json({ polls });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const user = getUserFromCookies(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // Try backend first
        try {
            if (body.question && body.options) {
                const res = await fetch(`${API_BASE}/polls`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (res.ok && data.poll) {
                    const p = data.poll;
                    return NextResponse.json({
                        poll: { ...p, id: p._id, voted: undefined, options: p.options.map((o: any) => ({ ...o, votes: 0 })) }
                    });
                }
                throw new Error('Backend poll creation failed');
            }

            // Vote request via backend
            const { id, optionIndex } = body;
            const res = await fetch(`${API_BASE}/polls/${id}/vote`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ optionIndex })
            });
            const data = await res.json();
            if (res.ok && data.poll) {
                const p = data.poll;
                return NextResponse.json({
                    poll: {
                        ...p,
                        id: p._id,
                        voted: optionIndex,
                        options: p.options.map((o: any) => ({ ...o, votes: Array.isArray(o.votes) ? o.votes.length : 0 }))
                    }
                });
            }
            throw new Error('Backend vote failed');
        } catch {
            // Fallback to in-memory store
            if (body.question && body.options) {
                // Create poll in store
                const newPoll = {
                    id: `poll_${Date.now()}`,
                    question: body.question,
                    options: body.options.map((o: any) => ({ label: o.label, votes: 0 })),
                    totalVotes: 0,
                    endDate: body.endDate ? new Date(body.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'In 7 days',
                    author: { id: user.id, name: user.name || 'You', username: user.username || 'you', avatar: '', bio: '', role: 'citizen' as const, verified: false, followers: 0, following: 0, joined: '2024' },
                    userVotes: {} as Record<string, number>
                };
                store.polls.unshift(newPoll);
                return NextResponse.json({
                    poll: {
                        id: newPoll.id,
                        question: newPoll.question,
                        options: newPoll.options,
                        totalVotes: 0,
                        endDate: newPoll.endDate,
                        author: newPoll.author,
                        voted: undefined
                    }
                });
            }

            // Vote in store
            const { id, optionIndex } = body;
            const poll = store.polls.find(p => p.id === id);
            if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

            // Toggle vote
            const prevVote = poll.userVotes[user.id];
            if (prevVote === optionIndex) {
                delete poll.userVotes[user.id];
            } else {
                poll.userVotes[user.id] = optionIndex;
            }

            const currentVote = poll.userVotes[user.id];
            return NextResponse.json({
                poll: {
                    id: poll.id,
                    question: poll.question,
                    options: poll.options.map((o, idx) => ({
                        label: o.label,
                        votes: o.votes + Object.values(poll.userVotes).filter(v => v === idx).length
                    })),
                    totalVotes: poll.totalVotes + Object.keys(poll.userVotes).length,
                    endDate: poll.endDate,
                    author: poll.author,
                    voted: currentVote !== undefined ? currentVote : undefined
                }
            });
        }
    } catch (e: any) {
        console.error('Poll operation failed:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
