import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/wallet/transactions etc
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const subpath = path.join('/');

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();

    if (subpath === 'transactions') {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const type = url.searchParams.get('type');
        const offset = (page - 1) * limit;

        const { data: wallet } = await admin.from('wallets').select('id').eq('user_id', user.id).single();
        if (!wallet) return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } });

        let query = admin
            .from('wallet_transactions')
            .select('*', { count: 'exact' })
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type) query = query.eq('type', type);

        const { data: transactions, count } = await query;

        return NextResponse.json({
            success: true,
            data: (transactions || []).map(t => ({
                _id: t.id,
                type: t.type,
                amount: t.amount,
                description: t.description || '',
                balanceAfter: t.balance_after,
                timestamp: t.created_at,
                status: 'completed',
            })),
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}

// POST /api/wallet/deposit, /api/wallet/withdraw, /api/wallet/toggle-2fa
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const subpath = path.join('/');

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();

    if (subpath === 'deposit' || subpath === 'withdraw') {
        let body: { amount?: number } = {};
        try { body = await req.json(); } catch { /* no body */ }

        const numAmount = Number(body.amount);
        if (!numAmount || numAmount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        const { data: wallet } = await admin.from('wallets').select('*').eq('user_id', user.id).single();
        if (!wallet) return NextResponse.json({ success: false, message: 'Wallet not found' }, { status: 404 });

        if (subpath === 'deposit') {
            if (numAmount > 100000) return NextResponse.json({ success: false, message: 'Maximum deposit is 100,000' }, { status: 400 });
            const newBalance = wallet.balance + numAmount;
            await admin.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
            await admin.from('wallet_transactions').insert({
                wallet_id: wallet.id, type: 'deposit', amount: numAmount,
                balance_after: newBalance, description: `Deposited ${numAmount} credits`,
            });
            return NextResponse.json({ success: true, data: { balance: newBalance, message: `Deposited ${numAmount} credits` } });
        }

        if (subpath === 'withdraw') {
            if (wallet.balance < numAmount) {
                return NextResponse.json({ success: false, message: `Insufficient balance. Available: ${wallet.balance}` }, { status: 400 });
            }
            const newBalance = wallet.balance - numAmount;
            await admin.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
            await admin.from('wallet_transactions').insert({
                wallet_id: wallet.id, type: 'withdraw', amount: numAmount,
                balance_after: newBalance, description: `Withdrew ${numAmount} credits`,
            });
            return NextResponse.json({ success: true, data: { balance: newBalance, message: `Withdrew ${numAmount} credits` } });
        }
    }

    if (subpath === 'toggle-2fa') {
        return NextResponse.json({ success: true, data: { twoFactorWithdraw: false } });
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}
