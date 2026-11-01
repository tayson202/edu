'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Star, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  Video, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';
import { loadState, getCurrentUser } from '@/lib/storage';
import { Course, TransactionLedger, TeacherPayout } from '@/lib/types';
import AICourseGeneratorModal from '@/components/ai/AICourseGeneratorModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TeacherDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [courses, setCourses] = useState<Course[]>([]);
  const [ledger, setLedger] = useState<TransactionLedger[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const u = getCurrentUser(state);
      setUser(u);
      setCourses(state.courses.filter(c => c.teacherId === u.id || u.role === 'TEACHER'));
      setLedger(state.ledger);
      setPayouts(state.payouts.filter(p => p.teacherId === u.id));
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  // Compute Financial Aggregations
  const totalGrossCents = ledger.reduce((acc, l) => acc + l.grossAmountCents, 0);
  const totalCommissionCents = ledger.reduce((acc, l) => acc + l.platformFeeCents, 0);
  const totalNetEarningsCents = ledger.reduce((acc, l) => acc + l.teacherShareCents, 0);
  const totalStudents = courses.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  return (
    <ProtectedRoute allowedRole="TEACHER" dashboardTitle="Teacher Studio">
      <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. STUDIO HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>Creator & Instructor Studio</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{user.name}’s Studio</span>
              <span title="Verified Creator" className="inline-flex items-center">
                <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your course catalog, track real-time sales ledger, and generate curriculum with AI.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/profile"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Edit Educator Profile & Payout Setup"
            >
              <UserIcon className="w-4 h-4 text-emerald-500" />
              <span>Instructor Profile</span>
            </Link>

            <button
              onClick={() => setShowAIGenerator(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Course Generator</span>
            </button>

            <Link
              href="/teacher/builder"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>

        {/* 2. REVENUE & FINANCIAL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Net Earnings (85%)</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${(totalNetEarningsCents / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> Direct Payout Available
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Gross Sales</span>
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${(totalGrossCents / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">
              Platform Fee (15%): -${(totalCommissionCents / 100).toFixed(2)}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Enrolled Students</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalStudents.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Across {courses.length} Published Courses</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Instructor Rating</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              4.93 ★
            </div>
            <div className="text-[11px] text-slate-500">From 500+ student evaluations</div>
          </div>

        </div>

        {/* 3. COURSE MANAGEMENT TABLE */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Catalog & Curriculum
              </h2>
              <p className="text-xs text-slate-500">Create, edit, manage pricing, and preview courses.</p>
            </div>
            <Link
              href="/teacher/builder"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>Course Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnailUrl}
                          alt={c.title}
                          className="w-12 h-8 rounded-lg object-cover"
                        />
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-xs">
                          {c.title}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {c.categoryName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {c.isFree ? 'Free' : `$${((c.discountPriceCents ?? c.priceCents) / 100).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {c.studentCount}
                    </td>
                    <td className="py-3.5 px-4 text-amber-500 font-bold">
                      ★ {c.ratingAvg.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/courses/${c.id}`}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                      >
                        Preview
                      </Link>
                      <Link
                        href="/teacher/builder"
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. FINANCIAL LEDGER & PAYOUTS SHORTCUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Sales Ledger</h3>
              <Link href="/teacher/earnings" className="text-xs text-brand-600 font-semibold hover:underline">
                View Full Ledger
              </Link>
            </div>
            <div className="space-y-2">
              {ledger.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{item.courseTitle}</div>
                    <div className="text-[10px] text-slate-400">{item.buyerName} • {item.orderNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">+${(item.teacherShareCents / 100).toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">15% fee: -${(item.platformFeeCents / 100).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Payout History</h3>
              <Link href="/teacher/earnings" className="text-xs text-brand-600 font-semibold hover:underline">
                Request Payout
              </Link>
            </div>
            <div className="space-y-2">
              {payouts.map((pay) => (
                <div key={pay.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">${(pay.amountCents / 100).toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">{pay.method}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    pay.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pay.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Course Generator Modal */}
      <AICourseGeneratorModal
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onApplyOutline={(outline) => {
          alert(`Syllabus generated for "${outline.title}" with ${outline.sections.length} modules! Redirecting to builder...`);
        }}
      />
      </div>
    </ProtectedRoute>
  );
}
