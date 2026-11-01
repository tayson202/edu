'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  DollarSign, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  TrendingUp, 
  AlertCircle, 
  Activity,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  loadState, 
  getCurrentUser, 
  reviewPayout, 
  updatePlatformCommission 
} from '@/lib/storage';
import { PlatformSetting, TeacherPayout, AuditLog, User } from '@/lib/types';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState(() => getCurrentUser(loadState()));
  const [settings, setSettings] = useState<PlatformSetting>(() => loadState().settings);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Commission Edit Form
  const [commissionRate, setCommissionRate] = useState(15);
  const [commissionSaved, setCommissionSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      setAdminUser(getCurrentUser(state));
      setSettings(state.settings);
      setCommissionRate(state.settings.commissionPercent);
      setPayouts(state.payouts);
      setAuditLogs(state.auditLogs);
      setUsers(state.users);
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  const handleUpdateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformCommission(commissionRate);
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 2000);
  };

  const handlePayoutAction = (payoutId: string, approve: boolean) => {
    reviewPayout(payoutId, approve);
  };

  const pendingPayouts = payouts.filter(p => p.status === 'REQUESTED');
  const teachersCount = users.filter(u => u.role === 'TEACHER').length;
  const studentsCount = users.filter(u => u.role === 'STUDENT').length;

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Administration & Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Global Platform Control Center
            </h1>
            <p className="text-xs text-slate-500">
              Logged in as {adminUser.name}. Manage marketplace commission, audit payouts, and review logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Edit Admin Profile & Governance Settings"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Admin Governance Profile</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">System: Optimal</span>
            </div>
          </div>
        </div>

        {/* 1. PLATFORM OVERVIEW METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commission Rate</div>
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
              {settings.commissionPercent}%
            </div>
            <div className="text-[11px] text-slate-500">Dynamic admin configurable</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Payout Claims</div>
            <div className="text-3xl font-extrabold text-amber-500">
              {pendingPayouts.length}
            </div>
            <div className="text-[11px] text-slate-500">Awaiting administrative approval</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Teachers</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {teachersCount}
            </div>
            <div className="text-[11px] text-slate-500">Verified instructors & academies</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Students</div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {studentsCount}
            </div>
            <div className="text-[11px] text-slate-500">Registered learners</div>
          </div>
        </div>

        {/* 2. DYNAMIC COMMISSION CONFIGURATION CARD */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Configurable Marketplace Revenue Model
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            As required by platform policy, platform commissions are dynamically configurable by authorized administrators rather than hardcoded. Modifying this rate will update all subsequent course purchases and generate an immutable audit log row.
          </p>

          <form onSubmit={handleUpdateCommission} className="flex flex-wrap items-center gap-4 pt-2">
            <div className="w-48">
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Platform Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseInt(e.target.value || '0', 10))}
                  className="w-full px-4 py-2.5 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>

            <div className="pt-5">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
              >
                Update Platform Commission
              </button>
            </div>

            {commissionSaved && (
              <div className="pt-5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Commission updated to {commissionRate}% and logged in audit trails!</span>
              </div>
            )}
          </form>
        </div>

        {/* 3. PENDING PAYOUTS MANAGEMENT QUEUE */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Teacher Payout Approval Queue
              </h2>
              <p className="text-xs text-slate-500">Inspect and approve withdrawal claims submitted by instructors.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {pendingPayouts.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payout Method</th>
                  <th className="py-3 px-4">Claim Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payouts.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {pay.teacherName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      ${(pay.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {pay.method}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(pay.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pay.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {pay.status === 'REQUESTED' ? (
                        <>
                          <button
                            onClick={() => handlePayoutAction(pay.id, true)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePayoutAction(pay.id, false)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-600 hover:text-white"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {pay.referenceCode || 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. IMMUTABLE PLATFORM AUDIT LOGS */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Platform Governance Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time record of sensitive administrative events, verification actions, and fee alterations.
          </p>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-600 dark:text-brand-400">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{log.actorName}</span>
                  </div>
                  <div className="text-slate-500">{log.details}</div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
