'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  User as UserIcon,
  Building2,
  Award,
  Lock,
  LogOut,
  AlertCircle,
  FileCheck,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  loadState, 
  getCurrentUser, 
  getTeacherMemberships, 
  leaveAcademy,
  setTeacherWorkingMode 
} from '@/lib/storage';
import { Course, TransactionLedger, TeacherPayout, AcademyMembership, TeacherWorkingMode } from '@/lib/types';
import AICourseGeneratorModal from '@/components/ai/AICourseGeneratorModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function TeacherDashboardContent() {
  const searchParams = useSearchParams();
  const initialModeParam = searchParams.get('mode');

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [courses, setCourses] = useState<Course[]>([]);
  const [ledger, setLedger] = useState<TransactionLedger[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [memberships, setMemberships] = useState<AcademyMembership[]>([]);
  const [activeTabMode, setActiveTabMode] = useState<TeacherWorkingMode>('INDEPENDENT');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Leave Academy confirmation modal
  const [leaveModalMembership, setLeaveModalMembership] = useState<AcademyMembership | null>(null);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const u = getCurrentUser(state);
      setUser(u);
      setCourses(state.courses);
      setLedger(state.ledger);
      setPayouts(state.payouts.filter(p => p.teacherId === u.id));

      const mems = getTeacherMemberships(u.id, state);
      setMemberships(mems);

      // Determine initial mode
      if (initialModeParam === 'academy' || initialModeParam === 'academy_affiliated') {
        setActiveTabMode('ACADEMY_AFFILIATED');
      } else if (u.teacherProfile?.preferredWorkingMode) {
        setActiveTabMode(u.teacherProfile.preferredWorkingMode);
      } else if (mems.some(m => m.status === 'APPROVED')) {
        // default to independent with option to switch
        setActiveTabMode('INDEPENDENT');
      }
    };

    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, [initialModeParam]);

  if (!mounted) return null;

  // Filter Courses based on ownership
  const independentCourses = courses.filter(
    c => !c.isAcademyOwned && (c.teacherId === user.id || user.role === 'TEACHER')
  );

  const approvedMembership = memberships.find(m => m.status === 'APPROVED');
  const pendingMemberships = memberships.filter(m => m.status === 'PENDING');
  const rejectedMemberships = memberships.filter(m => m.status === 'REJECTED');

  // Academy courses assigned to this teacher or associated with the approved academy
  const academyCourses = courses.filter(c => {
    if (!c.isAcademyOwned) return false;
    if (!approvedMembership) return false;
    const isAcademyMatch = c.organizationId === approvedMembership.academyUserId || 
                           c.organizationId === approvedMembership.academyId ||
                           c.academyId === approvedMembership.academyId;
    const isAssigned = (approvedMembership.assignedCourseIds || []).includes(c.id) || c.teacherId === user.id;
    return isAcademyMatch && isAssigned;
  });

  // Financial calculations for Independent teaching
  const totalGrossCents = ledger.reduce((acc, l) => acc + l.grossAmountCents, 0);
  const totalCommissionCents = ledger.reduce((acc, l) => acc + l.platformFeeCents, 0);
  const totalNetEarningsCents = ledger.reduce((acc, l) => acc + l.teacherShareCents, 0);
  const totalIndependentStudents = independentCourses.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  const handleConfirmLeaveAcademy = () => {
    if (!leaveModalMembership) return;
    setLeaveSubmitting(true);
    leaveAcademy({
      teacherId: user.id,
      membershipId: leaveModalMembership.id,
    });
    setLeaveSubmitting(false);
    setLeaveMessage(`You have resigned from ${leaveModalMembership.academyName}. Your independent account and courses remain fully active.`);
    setTimeout(() => {
      setLeaveModalMembership(null);
      setLeaveMessage(null);
      setActiveTabMode('INDEPENDENT');
    }, 1800);
  };

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
              Manage your personal and academy-affiliated teaching workflows, permissions, and curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/teacher/mode"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Configure Career Working Mode"
            >
              <Award className="w-4 h-4 text-brand-600" />
              <span>Working Mode</span>
            </Link>

            <Link
              href="/profile"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 shadow-sm flex items-center gap-1.5 transition-colors"
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

        {/* 2. DYNAMIC WORKING-MODE SWITCHER (REQUIREMENT 1 & 4) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 sm:p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* OPTION A: INDEPENDENT TEACHER TAB */}
            <button
              onClick={() => setActiveTabMode('INDEPENDENT')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                activeTabMode === 'INDEPENDENT'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Option A: Independent Studio</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTabMode === 'INDEPENDENT' ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {independentCourses.length}
              </span>
            </button>

            {/* OPTION B: ACADEMY TEACHER TAB */}
            <button
              onClick={() => setActiveTabMode('ACADEMY_AFFILIATED')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                activeTabMode === 'ACADEMY_AFFILIATED'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Option B: Academy Faculty Workspace</span>
              {approvedMembership && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 pr-3">
            <span className="hidden md:inline">Current View:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              {activeTabMode === 'INDEPENDENT' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Independent Creator (Autonomous Brand)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>Institutional Academy Faculty</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: INDEPENDENT TEACHER STUDIO */}
        {/* ------------------------------------------------------------- */}
        {activeTabMode === 'INDEPENDENT' && (
          <div className="space-y-8 animate-fade-in">

            {/* A. REVENUE & FINANCIAL METRICS */}
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
                  {totalIndependentStudents.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">Across {independentCourses.length} Independent Courses</div>
              </div>

              <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Independent Catalog</span>
                  <BookOpen className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {independentCourses.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">100% Personal Ownership</div>
              </div>
            </div>

            {/* B. ACADEMY OPPORTUNITY PROMOTION BANNER */}
            {!approvedMembership && (
              <div className="rounded-3xl p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-800/40 shadow-md">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                    <Building2 className="w-3 h-3" />
                    <span>Expand Your Reach</span>
                  </div>
                  <h3 className="text-base font-bold">Teach with an Accredited Academy</h3>
                  <p className="text-xs text-purple-200/80 max-w-xl">
                    You can join partner institutions as an affiliated instructor while keeping your independent courses and personal brand completely separate.
                  </p>
                </div>
                <Link
                  href="/academies"
                  className="px-4 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Browse Academies & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* C. INDEPENDENT COURSES CATALOG TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    <span>Your Independent Course Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Courses published under your independent educator brand. You retain direct ownership and student relationships.
                  </p>
                </div>
                <Link
                  href="/teacher/builder"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Independent Course</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-6">Course Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Students</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {independentCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.thumbnailUrl}
                              alt={c.title}
                              className="w-12 h-8 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                                {c.title}
                              </div>
                              <div className="text-[10px] text-emerald-600 font-semibold">
                                Independent • {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{c.categoryName}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {c.isFree ? 'Free' : `$${((c.discountPriceCents ?? c.priceCents) / 100).toFixed(2)}`}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {c.studentCount}
                        </td>
                        <td className="py-4 px-4 text-amber-500 font-bold">
                          ★ {c.ratingAvg.toFixed(1)}
                        </td>
                        <td className="py-4 px-6 text-right space-x-3">
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

            {/* D. FINANCIAL LEDGER & PAYOUTS SHORTCUT */}
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
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: ACADEMY TEACHER WORKSPACE */}
        {/* ------------------------------------------------------------- */}
        {activeTabMode === 'ACADEMY_AFFILIATED' && (
          <div className="space-y-8 animate-fade-in">

            {/* Scenario 1: Active Approved Membership */}
            {approvedMembership ? (
              <div className="space-y-8">

                {/* A. ACADEMY AFFILIATION HERO */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={approvedMembership.academyLogoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'}
                        alt={approvedMembership.academyName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200 dark:border-purple-800 shadow-sm"
                      />
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active Faculty Member</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                          {approvedMembership.academyName}
                        </h2>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                          Appointed Role: {approvedMembership.roleTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/academies/${approvedMembership.academyUserId}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Public Profile</span>
                      </Link>

                      <button
                        onClick={() => setLeaveModalMembership(approvedMembership)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Leave Academy</span>
                      </button>
                    </div>
                  </div>

                  {/* B. GRANULAR PERMISSION CARDS (REQUIREMENT 1, 2 & 4) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Assigned Institutional Permissions & Clearances</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        approvedMembership.permissions.canCreateCourses
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Course Creation</span>
                          {approvedMembership.permissions.canCreateCourses ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {approvedMembership.permissions.canCreateCourses ? 'Authorized under brand' : 'Restricted'}
                        </p>
                      </div>

                      <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        approvedMembership.permissions.canEditAcademyCourses
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Course Editing</span>
                          {approvedMembership.permissions.canEditAcademyCourses ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {approvedMembership.permissions.canEditAcademyCourses ? 'Manage syllabus & lessons' : 'Restricted'}
                        </p>
                      </div>

                      <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        approvedMembership.permissions.canViewStudents
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Cohort Progress</span>
                          {approvedMembership.permissions.canViewStudents ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {approvedMembership.permissions.canViewStudents ? 'View enrolled students' : 'Restricted'}
                        </p>
                      </div>

                      <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        approvedMembership.permissions.canManageAssignments
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Grading & Quizzes</span>
                          {approvedMembership.permissions.canManageAssignments ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {approvedMembership.permissions.canManageAssignments ? 'Review submissions' : 'Restricted'}
                        </p>
                      </div>

                      <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        approvedMembership.permissions.canHostLiveSessions
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Live Masterclasses</span>
                          {approvedMembership.permissions.canHostLiveSessions ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {approvedMembership.permissions.canHostLiveSessions ? 'Host interactive live runs' : 'Restricted'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* C. ACADEMY-OWNED ASSIGNED COURSES */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <span>Academy Curriculum Assigned to You</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Courses owned by {approvedMembership.academyName} that you are authorized to instruct or manage.
                      </p>
                    </div>

                    {approvedMembership.permissions.canCreateCourses && (
                      <Link
                        href="/teacher/builder"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Author Academy Course</span>
                      </Link>
                    )}
                  </div>

                  {academyCourses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3 px-6">Course Name</th>
                            <th className="py-3 px-4">Academy Brand</th>
                            <th className="py-3 px-4">Permissions</th>
                            <th className="py-3 px-4">Cohort Students</th>
                            <th className="py-3 px-4">Rating</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {academyCourses.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={c.thumbnailUrl}
                                    alt={c.title}
                                    className="w-12 h-8 rounded-lg object-cover shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                                      {c.title}
                                    </div>
                                    <div className="text-[10px] text-purple-600 font-semibold">
                                      Academy Owned • {approvedMembership.academyName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                {approvedMembership.academyName}
                              </td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                  {approvedMembership.permissions.canEditAcademyCourses ? 'Full Instructor Access' : 'View Only'}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                                {c.studentCount}
                              </td>
                              <td className="py-4 px-4 text-amber-500 font-bold">
                                ★ {c.ratingAvg.toFixed(1)}
                              </td>
                              <td className="py-4 px-6 text-right space-x-3">
                                <Link
                                  href={`/courses/${c.id}`}
                                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                                >
                                  Preview
                                </Link>
                                {approvedMembership.permissions.canEditAcademyCourses && (
                                  <Link
                                    href="/teacher/builder"
                                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                                  >
                                    Manage
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Academy Courses Assigned Yet</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        The academy administrator will assign specific curriculum modules to your roster or grant course creation clearance.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : null}

            {/* Scenario 2: Pending Application */}
            {pendingMemberships.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Academy Application Under Review
                    </h3>
                    <p className="text-xs text-slate-500">
                      Your request has been delivered to the institutional administrator.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingMemberships.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{p.academyName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          Status: Pending Review
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Role Applied:</strong> {p.roleTitle}
                      </div>
                      {p.applicationMessage && (
                        <p className="text-xs text-slate-500 italic bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                          "{p.applicationMessage}"
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400">
                        Submitted on {new Date(p.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scenario 3: Rejected Applications */}
            {rejectedMemberships.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Past Application Updates</h3>
                {rejectedMemberships.map((r) => (
                  <div key={r.id} className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{r.academyName}</div>
                      <div className="text-[11px] text-rose-600">Decision: Not approved ({r.rejectionReason || 'No notes'})</div>
                    </div>
                    <Link
                      href="/academies"
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-purple-600"
                    >
                      Browse Other Academies
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Scenario 4: No Membership Yet */}
            {!approvedMembership && pendingMemberships.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center">
                  <Building2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  You Are Not Currently Affiliated with an Academy
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Join an accredited institution to syndicate courses, teach corporate cohorts, and earn teaching credentials while keeping your personal creator account independent.
                </p>
                <div className="pt-2">
                  <Link
                    href="/academies"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <span>Browse Partner Academies</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        )}

        </div>

        {/* 3. LEAVE ACADEMY CONFIRMATION MODAL (REQUIREMENT 3 & 5) */}
        {leaveModalMembership && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Resign from {leaveModalMembership.academyName}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are about to cancel your faculty membership with this academy.
                </p>
              </div>

              {/* Account Preservation Guarantee */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Account & Content Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Leaving an academy does <strong>not</strong> delete your teacher account or your independent courses. You will continue to have full access to your independent teaching studio and earnings.
                </p>
              </div>

              {leaveMessage && (
                <div className="p-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800">
                  {leaveMessage}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLeaveModalMembership(null)}
                  disabled={leaveSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLeaveAcademy}
                  disabled={leaveSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {leaveSubmitting ? 'Resigning...' : 'Confirm & Leave'}
                </button>
              </div>
            </div>
          </div>
        )}

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

export default function TeacherDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading teacher dashboard...</p>
        </div>
      </div>
    }>
      <TeacherDashboardContent />
    </Suspense>
  );
}
