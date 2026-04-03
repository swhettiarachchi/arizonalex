import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@/lib/supabase-auth';

// GET /api/wallet — get user wallet
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        // Get or create wallet
        let { data: wallet } = await admin
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!wallet) {
            const { data: newWallet } = await admin
                .from('wallets')
                .insert({ user_id: user.id, balance: 100, currency: 'AZC' })
                .select()
                .single();
            wallet = newWallet;
        }

        if (!wallet) {
            return NextResponse.json({ success: false, message: 'Failed to get wallet' }, { status: 500 });
        }

        // Get recent transactions
        const { data: transactions } = await admin
            .from('wallet_transactions')
            .select('*')
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false })
            .limit(20);

        return NextResponse.json({
            success: true,
            data: {
                balance: wallet.balance,
                escrowBalance: 0,
                totalEarned: 0,
                totalSpent: 0,
                totalDebates: 0,
                totalWins: 0,
                winRate: 0,
                twoFactorWithdraw: false,
                recentTransactions: (transactions || []).map(t => ({
                    _id: t.id,
                    type: t.type,
                    amount: t.amount,
                    description: t.description || '',
                    balanceAfter: t.balance_after,
                    timestamp: t.created_at,
                    status: 'completed',
                })),
            },
        });
    } catch (err) {
        console.error('Wallet GET error:', err);
        return NextResponse.json({ success: false, message: 'Failed to fetch wallet' }, { status: 500 });
    }
}

// POST /api/wallet — deposit or withdraw
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { action, amount } = await req.json();
        const numAmount = Number(amount);

        if (!numAmount || numAmount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Get wallet
        const { data: wallet } = await admin
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!wallet) {
            return NextResponse.json({ success: false, message: 'Wallet not found' }, { status: 404 });
        }

        if (action === 'deposit') {
            if (numAmount > 100000) {
                return NextResponse.json({ success: false, message: 'Maximum deposit is 100,000 credits' }, { status: 400 });
            }

            const newBalance = wallet.balance + numAmount;

            await admin.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);

            await admin.from('wallet_transactions').insert({
                wallet_id: wallet.id,
                type: 'deposit',
                amount: numAmount,
                balance_after: newBalance,
                description: `Deposited ${numAmount} credits`,
            });

            return NextResponse.json({
                success: true,
                data: { balance: newBalance, message: `Successfully deposited ${numAmount} credits` },
            });
        }

        if (action === 'withdraw') {
            if (wallet.balance < numAmount) {
                return NextResponse.json({
                    success: false,
                    message: `Insufficient balance. Available: ${wallet.balance} credits`,
                }, { status: 400 });
            }

            const newBalance = wallet.balance - numAmount;

            await admin.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);

            await admin.from('wallet_transactions').insert({
                wallet_id: wallet.id,
                type: 'withdraw',
                amount: numAmount,
                balance_after: newBalance,
                description: `Withdrew ${numAmount} credits`,
            });

            return NextResponse.json({
                success: true,
                data: { balance: newBalance, message: `Successfully withdrew ${numAmount} credits` },
            });
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    } catch (err) {
        console.error('Wallet POST error:', err);
        return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 });
    }
}
