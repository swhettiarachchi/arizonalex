import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/supabase-auth';

export async function GET(req: NextRequest) {
    try {
        // Fetch real bills from GovTrack API
        const res = await fetch('https://www.govtrack.us/api/v2/bill?sort=-current_status_date&limit=10', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('GovTrack API failed');

        const data = await res.json();

        const liveBills = data.objects.map((bill: any, index: number) => {
            let st = 'committee';
            if (bill.current_status === 'passed_bill') st = 'passed';
            if (bill.current_status === 'prov_kill_suspensionfailed') st = 'floor_vote';
            if (bill.current_status === 'reported') st = 'debate';

            const seed = bill.id || index;
            const simulatedFor = 15000 + (seed % 10000);
            const simulatedAgainst = 8000 + ((seed * 3) % 15000);

            return {
                id: bill.id.toString(),
                code: bill.display_number,
                title: bill.title_without_number,
                description: `Introduced by ${bill.sponsor?.name || 'Congress'}. Currently in status: ${bill.current_status_description}.`,
                status: st,
                category: bill.subject_wireframe || 'Legislation',
                forVotes: simulatedFor,
                againstVotes: simulatedAgainst,
                date: new Date(bill.current_status_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                daysActive: Math.max(1, Math.floor((new Date().getTime() - new Date(bill.introduced_date).getTime()) / (1000 * 3600 * 24))),
                userVote: null
            };
        });

        return NextResponse.json({ bills: liveBills });
    } catch (e) {
        console.error('Failed to fetch GovTrack bills:', e);
        return NextResponse.json({ bills: [] });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Bill voting is tracked via local state on the frontend since GovTrack doesn't support it
    // In future, this could connect to a backend bills collection
    try {
        const body = await req.json();
        return NextResponse.json({ success: true, bill: body });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
