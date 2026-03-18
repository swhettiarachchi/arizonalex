import { NextResponse, NextRequest } from 'next/server';
import { store, getUserFromCookies } from '@/lib/store';

export async function GET(req: NextRequest) {
    const user = getUserFromCookies(req.cookies.get('auth_token')?.value);

    try {
        const res = await fetch('https://www.govtrack.us/api/v2/bill?sort=-current_status_date&limit=10', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('GovTrack API failed');

        const data = await res.json();

        // Transform real GovTrack bills into our UI interface
        const liveBills = data.objects.map((bill: any, index: number) => {
            // Map GovTrack status to our UI status
            let st = 'committee';
            if (bill.current_status === 'passed_bill') st = 'passed';
            if (bill.current_status === 'prov_kill_suspensionfailed') st = 'floor_vote';
            if (bill.current_status === 'reported') st = 'debate';

            // Simulate engagement for the live bills since GovTrack doesn't have "social votes"
            const seed = bill.id || index;
            const simulatedFor = 15000 + (seed % 10000);
            const simulatedAgainst = 8000 + ((seed * 3) % 15000);

            // Pull user's local vote if they interacted with this live bill ID previously
            const localRecord = store.bills.find(b => b.id === bill.id.toString());
            let userVote = null;
            let forBonus = 0;
            let againstBonus = 0;

            if (localRecord) {
                forBonus = localRecord.votedFor.size;
                againstBonus = localRecord.votedAgainst.size;
                if (user && localRecord.votedFor.has(user.id)) userVote = 'support';
                if (user && localRecord.votedAgainst.has(user.id)) userVote = 'oppose';
            }

            return {
                id: bill.id.toString(),
                code: bill.display_number,
                title: bill.title_without_number,
                description: `Introduced by ${bill.sponsor?.name || 'Congress'}. Currently in status: ${bill.current_status_description}.`,
                status: st,
                category: bill.subject_wireframe || 'Legislation',
                forVotes: simulatedFor + forBonus,
                againstVotes: simulatedAgainst + againstBonus,
                date: new Date(bill.current_status_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                daysActive: Math.max(1, Math.floor((new Date().getTime() - new Date(bill.introduced_date).getTime()) / (1000 * 3600 * 24))),
                userVote: userVote
            };
        });

        liveBills.forEach((lb: any) => {
            if (!store.bills.find(sb => sb.id === lb.id)) {
                store.bills.push({
                    id: lb.id,
                    code: lb.code,
                    title: lb.title,
                    description: lb.description,
                    status: lb.status,
                    category: lb.category,
                    impact: lb.impact || 'National Impact',
                    sponsor: lb.sponsor || { id: 'sys', name: 'US Congress', username: 'uscongress', role: 'official', verified: true, followers: 0, following: 0, bio: '', joined: '2020', avatar: '' },
                    forVotes: 0,
                    againstVotes: 0,
                    date: lb.date,
                    daysActive: lb.daysActive,
                    votedFor: new Set(),
                    votedAgainst: new Set()
                } as any); // Type cast safely since we are generating a mock store record
            }
        });

        return NextResponse.json({ bills: liveBills });

    } catch (e) {
        console.error('Failed to fetch GovTrack bills:', e);
        // Fallback to mock data
        const fallbackBills = store.bills.filter(b => b.id.startsWith('b')).map(b => {
            let uv = null;
            if (user && b.votedFor && b.votedFor.has(user.id)) uv = 'support';
            if (user && b.votedAgainst && b.votedAgainst.has(user.id)) uv = 'oppose';
            return {
                ...b,
                forVotes: b.forVotes + (b.votedFor ? b.votedFor.size : 0),
                againstVotes: b.againstVotes + (b.votedAgainst ? b.votedAgainst.size : 0),
                userVote: uv
            };
        });
        return NextResponse.json({ bills: fallbackBills.length > 0 ? fallbackBills : store.bills });
    }
}

export async function POST(req: NextRequest) {
    const user = getUserFromCookies(req.cookies.get('auth_token')?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, type } = await req.json(); // type: 'support' | 'oppose'
    const bill = store.bills.find(b => b.id === id);
    if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });

    // Toggle voting
    if (type === 'support') {
        if (bill.votedFor.has(user.id)) {
            bill.votedFor.delete(user.id);
        } else {
            bill.votedFor.add(user.id);
            bill.votedAgainst.delete(user.id);
        }
    } else if (type === 'oppose') {
        if (bill.votedAgainst.has(user.id)) {
            bill.votedAgainst.delete(user.id);
        } else {
            bill.votedAgainst.add(user.id);
            bill.votedFor.delete(user.id);
        }
    }

    return NextResponse.json({
        bill: {
            ...bill,
            forVotes: bill.forVotes + bill.votedFor.size,
            againstVotes: bill.againstVotes + bill.votedAgainst.size,
            userVote: bill.votedFor.has(user.id) ? 'support' : bill.votedAgainst.has(user.id) ? 'oppose' : null
        }
    });
}
