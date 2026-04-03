'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/components/providers/SocketProvider';
import {
    WalletIcon, DollarSignIcon, TrophyIcon, TrendingUpIcon, ArrowUpRightIcon,
    ArrowDownRightIcon, ClockIcon, ShieldIcon, ZapIcon, SwordsIcon, CheckCircleIcon, XIcon
} from '@/components/ui/Icons';
import Link from 'next/link';
import type { WalletData, WalletTransaction } from '@/lib/types';

const TRANSACTION_ICONS: Record<string, React.ReactNode> = {
    deposit: <ArrowDownRightIcon size={16} />, withdraw: <ArrowUpRightIcon size={16} />,
    entry_fee: <SwordsIcon size={16} />, earning: <TrophyIcon size={16} />,
    refund: <ArrowDownRightIcon size={16} />, escrow_hold: <ShieldIcon size={16} />,
    escrow_release: <CheckCircleIcon size={16} />, platform_fee: <DollarSignIcon size={16} />,
    bonus: <ZapIcon size={16} />,
};

const TRANSACTION_COLORS: Record<string, string> = {
    deposit: '#10b981', withdraw: '#ef4444', entry_fee: '#f59e0b',
    earning: '#10b981', refund: '#3b82f6', escrow_hold: '#8b5cf6',
    escrow_release: '#10b981', platform_fee: '#ef4444', bonus: '#f59e0b',
};

function DepositModal({ onClose, onDeposit }: { onClose: () => void; onDeposit: (amount: number) => void }) {
    const [amount, setAmount] = useState('');
    const presets = [50, 100, 250, 500, 1000];
    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-card wallet-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><DollarSignIcon size={20} /> Deposit Credits</h2>
                    <button onClick={onClose} className="modal-close"><XIcon size={20} /></button>
                </div>
                <div className="wallet-modal-body">
                    <p className="wallet-modal-desc">Add credits to your wallet for debate entry fees</p>
                    <div className="wallet-preset-amounts">
                        {presets.map(p => (
                            <button key={p} className={`wallet-preset ${Number(amount) === p ? 'active' : ''}`} onClick={() => setAmount(String(p))}>${p}</button>
                        ))}
                    </div>
                    <div className="wallet-custom-amount">
                        <span className="wallet-currency">$</span>
                        <input type="number" placeholder="Custom amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" max="100000" className="wallet-amount-input" id="deposit-amount" />
                    </div>
                    <button className="btn btn-primary btn-lg wallet-action-btn" disabled={!amount || Number(amount) <= 0} onClick={() => { onDeposit(Number(amount)); onClose(); }} id="confirm-deposit">
                        Deposit ${amount || '0'} Credits
                    </button>
                </div>
            </div>
        </div>
    );
}

function WithdrawModal({ onClose, onWithdraw, maxAmount }: { onClose: () => void; onWithdraw: (amount: number) => void; maxAmount: number }) {
    const [amount, setAmount] = useState('');
    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-card wallet-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><ArrowUpRightIcon size={20} /> Withdraw Credits</h2>
                    <button onClick={onClose} className="modal-close"><XIcon size={20} /></button>
                </div>
                <div className="wallet-modal-body">
                    <p className="wallet-modal-desc">Available balance: <strong>${maxAmount.toFixed(2)}</strong></p>
                    <div className="wallet-preset-amounts">
                        {[25, 50, 100].filter(p => p <= maxAmount).map(p => (
                            <button key={p} className={`wallet-preset ${Number(amount) === p ? 'active' : ''}`} onClick={() => setAmount(String(p))}>${p}</button>
                        ))}
                        <button className={`wallet-preset ${Number(amount) === maxAmount ? 'active' : ''}`} onClick={() => setAmount(String(maxAmount))}>Max</button>
                    </div>
                    <div className="wallet-custom-amount">
                        <span className="wallet-currency">$</span>
                        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" max={maxAmount} className="wallet-amount-input" id="withdraw-amount" />
                    </div>
                    <button className="btn btn-primary btn-lg wallet-action-btn" disabled={!amount || Number(amount) <= 0 || Number(amount) > maxAmount}
                        onClick={() => { onWithdraw(Number(amount)); onClose(); }} id="confirm-withdraw">
                        Withdraw ${amount || '0'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function WalletPage() {
    const { isLoggedIn } = useAuth();
    const { socket } = useSocket();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [txFilter, setTxFilter] = useState<string>('all');

    const fetchWallet = useCallback(async () => {
        try {
            const res = await fetch('/api/wallet');
            const data = await res.json();
            if (data.success) setWallet(data.data);
        } catch (err) { console.error('Failed to fetch wallet:', err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (isLoggedIn) fetchWallet(); else setLoading(false); }, [isLoggedIn, fetchWallet]);

    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => fetchWallet();
        socket.on('wallet:update', handleUpdate);
        return () => { socket.off('wallet:update', handleUpdate); };
    }, [socket, fetchWallet]);

    const handleDeposit = async (amount: number) => {
        try {
            const res = await fetch('/api/wallet/deposit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (data.success) fetchWallet();
        } catch (err) { console.error('Deposit failed:', err); }
    };

    const handleWithdraw = async (amount: number) => {
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (data.success) fetchWallet();
        } catch (err) { console.error('Withdraw failed:', err); }
    };

    if (!isLoggedIn) return (
        <div className="page-container"><div className="feed-column"><div className="debate-empty"><WalletIcon size={48} /><h3>Sign in to view your wallet</h3><Link href="/login" className="btn btn-primary">Sign In</Link></div></div></div>
    );

    const filteredTx = wallet?.recentTransactions?.filter(t => txFilter === 'all' || t.type === txFilter) || [];

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header"><WalletIcon size={24} /><h1>Wallet</h1></div>

                {loading ? (
                    <div className="debate-room-loading"><div className="debate-spinner large" /><p>Loading wallet...</p></div>
                ) : wallet ? (
                    <>
                        <div className="wallet-balance-card">
                            <div className="wallet-balance-bg" />
                            <div className="wallet-balance-content">
                                <span className="wallet-balance-label">Available Balance</span>
                                <h2 className="wallet-balance-amount">${wallet.balance.toFixed(2)}</h2>
                                {wallet.escrowBalance > 0 && (
                                    <span className="wallet-escrow-label"><ShieldIcon size={14} /> ${wallet.escrowBalance.toFixed(2)} in escrow</span>
                                )}
                                <div className="wallet-balance-actions">
                                    <button className="btn btn-primary wallet-btn" onClick={() => setShowDeposit(true)} id="deposit-btn"><ArrowDownRightIcon size={18} /> Deposit</button>
                                    <button className="btn btn-outline wallet-btn" onClick={() => setShowWithdraw(true)} id="withdraw-btn"><ArrowUpRightIcon size={18} /> Withdraw</button>
                                </div>
                            </div>
                        </div>

                        <div className="wallet-stats-grid">
                            <div className="wallet-stat-card"><TrendingUpIcon size={20} /><span className="wallet-stat-value">${wallet.totalEarned.toFixed(2)}</span><span className="wallet-stat-label">Total Earned</span></div>
                            <div className="wallet-stat-card"><SwordsIcon size={20} /><span className="wallet-stat-value">{wallet.totalDebates}</span><span className="wallet-stat-label">Debates</span></div>
                            <div className="wallet-stat-card"><TrophyIcon size={20} /><span className="wallet-stat-value">{wallet.totalWins}</span><span className="wallet-stat-label">Wins</span></div>
                            <div className="wallet-stat-card"><ZapIcon size={20} /><span className="wallet-stat-value">{wallet.winRate}%</span><span className="wallet-stat-label">Win Rate</span></div>
                        </div>

                        <div className="wallet-tx-header">
                            <h3>Transaction History</h3>
                            <div className="wallet-tx-filters">
                                {['all', 'deposit', 'earning', 'entry_fee', 'withdraw', 'refund'].map(f => (
                                    <button key={f} className={`debate-chip ${txFilter === f ? 'active' : ''}`} onClick={() => setTxFilter(f)}>
                                        {f === 'all' ? 'All' : f === 'entry_fee' ? 'Fees' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="wallet-tx-list">
                            {filteredTx.length === 0 ? (
                                <div className="wallet-tx-empty"><ClockIcon size={32} /><p>No transactions yet</p></div>
                            ) : filteredTx.map((tx, i) => (
                                <div key={tx._id || i} className="wallet-tx-item">
                                    <div className="wallet-tx-icon" style={{ color: TRANSACTION_COLORS[tx.type] || '#6b7280' }}>{TRANSACTION_ICONS[tx.type] || <DollarSignIcon size={16} />}</div>
                                    <div className="wallet-tx-info">
                                        <span className="wallet-tx-desc">{tx.description}</span>
                                        <span className="wallet-tx-time">{new Date(tx.timestamp).toLocaleDateString()} at {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`wallet-tx-amount ${['deposit', 'earning', 'refund', 'escrow_release', 'bonus'].includes(tx.type) ? 'positive' : 'negative'}`}>
                                        {['deposit', 'earning', 'refund', 'escrow_release', 'bonus'].includes(tx.type) ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : null}

                {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} onDeposit={handleDeposit} />}
                {showWithdraw && wallet && <WithdrawModal onClose={() => setShowWithdraw(false)} onWithdraw={handleWithdraw} maxAmount={wallet.balance} />}
            </div>
        </div>
    );
}
