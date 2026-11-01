'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Plus, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { loadState, getCurrentUser, requestPayout } from '@/lib/storage';
import { TransactionLedger, TeacherPayout } from '@/lib/types';

export default function TeacherEarningsPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [ledger, setLedger] = useState<TransactionLedger[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [settings, setSettings] = useState(() => loadState().settings);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [amountInput, setAmountInput] = useState('500.00');
  const [payoutMethod, setPayoutMethod] = useState('Direct Bank Deposit (ACH)');
  const [payoutMsg, setPayoutMsg] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const u = getCurrentUser(state);
      setUser(u);
      setLedger(state.ledger.filter(l => l.teacherId === u.id || u.role === 'TEACHER'));
      setPayouts(state.payouts.filter(p => p.teacherId === u.id));
      setSettings(state.settings);
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  const grossTotal = ledger.reduce((acc, l) => acc + l.grossAmountCents, 0);
  const feeTotal = ledger.reduce((acc, l) => acc + l.platformFeeCents, 0);
  const netTotal = ledger.reduce((acc, l) => acc + l.teacherShareCents, 0);
  const paidTotal = payouts.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amountCents, 0);
  const availableBalance = Math.max(0, netTotal - paidTotal);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMsg(null);

    const cents = Math.round(parseFloat(amountInput || '0') * 100);
    if (isNaN(cents) || cents <= 0) {
      setPayoutMsg({ error: 'Please enter a valid amount.' });
      return;
    }

    if (cents > availableBalance) {
      setPayoutMsg({ error: `Amount exceeds available balance ($${(availableBalance / 100).toFixed(2)}).` });
      return;
    }

    const res = requestPayout(user.id, cents, payoutMethod);
    if (!res.success) {
      setPayoutMsg({ error: res.message });
    } else {
      setPayoutMsg({ success: 'Payout claim submitted successfully! Admin will review within 24 hours.' });
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutMsg(null);
      }, 1500);
    }
  };

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/teacher/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Financial Ledger & Payouts
            </h1>
            <p className="text-xs text-slate-500">
              Transparent, double-entry marketplace transaction accounting and withdrawal management.
            </p>
          </div>

          <button
            onClick={() => setShowPayoutModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>Request Payout (${(availableBalance / 100).toFixed(2)})</span>
          </button>
        </div>

        {/* 1. FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Balance</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${(availableBalance / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Ready for instant withdrawal</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Earned (85%)</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              ${(netTotal / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Total lifetime creator earnings</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Fee ({settings.commissionPercent}%)</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-500">
              -${(feeTotal / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Hosting, video streaming & processing</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Disbursed</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400">
              ${(paidTotal / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Successfully paid out</div>
          </div>

        </div>

        {/* 2. IMMUTABLE TRANSACTION LEDGER TABLE */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Transaction Ledger</h2>
              <p className="text-xs text-slate-500">Every student purchase snapshot with exact fee breakdowns.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Gross Sale</th>
                  <th className="py-3 px-4">Platform Fee ({settings.commissionPercent}%)</th>
                  <th className="py-3 px-4">Your Net (85%)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {item.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.buyerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium max-w-xs truncate">
                      {item.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${(item.grossAmountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-500">
                      -${(item.platformFeeCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600">
                      +${(item.teacherShareCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PAYOUT HISTORY TABLE */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Payout History & Claims</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference Code</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500">{p.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ${(p.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{p.method}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.referenceCode || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(p.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PAYOUT REQUEST MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Request Earnings Withdrawal
            </h3>
            <p className="text-xs text-slate-500">
              Minimum payout threshold is ${(settings.minPayoutCents / 100).toFixed(2)}. Available balance: ${(availableBalance / 100).toFixed(2)}.
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Direct Bank Deposit (ACH)">Direct Bank Deposit (ACH)</option>
                  <option value="PayPal Instant">PayPal</option>
                  <option value="Stripe Connect">Stripe Connect Direct</option>
                </select>
              </div>

              {payoutMsg?.error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-xs text-rose-600 dark:text-rose-300">
                  {payoutMsg.error}
                </div>
              )}

              {payoutMsg?.success && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-xs text-emerald-600 dark:text-emerald-300">
                  {payoutMsg.success}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Confirm Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
