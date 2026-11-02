'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  Building2, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  BookOpen, 
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { loadState, getCurrentUser, isUserAuthenticated, setTeacherWorkingMode, getTeacherMemberships } from '@/lib/storage';
import { User, TeacherWorkingMode, AcademyMembership } from '@/lib/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TeacherModeSelectionPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<AcademyMembership[]>([]);
  const [selectedMode, setSelectedMode] = useState<TeacherWorkingMode>('INDEPENDENT');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    const u = getCurrentUser(state);
    setUser(u);
    if (u?.teacherProfile?.preferredWorkingMode) {
      setSelectedMode(u.teacherProfile.preferredWorkingMode);
    }
    if (u) {
      const mems = getTeacherMemberships(u.id, state);
      setMemberships(mems);
      // If approved academy teacher, default can be academy if preferred
      if (mems.some(m => m.status === 'APPROVED') && !u.teacherProfile?.preferredWorkingMode) {
        setSelectedMode('ACADEMY_AFFILIATED');
      }
    }
  }, []);

  if (!mounted) return null;

  const handleSelectMode = (mode: TeacherWorkingMode) => {
    setSelectedMode(mode);
  };

  const handleConfirm = () => {
    if (!user) return;
    setSaving(true);
    setTeacherWorkingMode(user.id, selectedMode);
    setSavedSuccess(true);
    setTimeout(() => {
      router.push(`/teacher/dashboard?mode=${selectedMode.toLowerCase()}`);
    }, 700);
  };

  const approvedMembership = memberships.find(m => m.status === 'APPROVED');
  const pendingMembership = memberships.find(m => m.status === 'PENDING');

  return (
    <ProtectedRoute allowedRole="TEACHER" dashboardTitle="Educator Working Mode">
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 flex flex-col justify-center transition-colors">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-xs">
              <Award className="w-3.5 h-3.5" />
              <span>Educator Career Configuration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Choose Your Teaching Working Mode
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Every teacher has their own independent account. You can work autonomously under your personal brand, affiliate with accredited academies, or flexibly toggle between both workspaces.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* OPTION A: INDEPENDENT TEACHER */}
            <div
              onClick={() => handleSelectMode('INDEPENDENT')}
              className={`cursor-pointer rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 relative flex flex-col justify-between ${
                selectedMode === 'INDEPENDENT'
                  ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl ring-4 ring-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300'
              }`}
            >
              {selectedMode === 'INDEPENDENT' && (
                <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1.5">
                    Option A
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Independent Teacher
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Teach autonomously under your own name and build your independent digital academy.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Create & price your own independent courses</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Upload lessons, educational materials, quizzes & assignments</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Receive 85% revenue payouts directly to your account</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>All courses & student relationships belong exclusively to you</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    selectedMode === 'INDEPENDENT'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {selectedMode === 'INDEPENDENT' ? 'Selected Mode' : 'Select Independent Mode'}
                </button>
              </div>
            </div>

            {/* OPTION B: ACADEMY TEACHER */}
            <div
              onClick={() => handleSelectMode('ACADEMY_AFFILIATED')}
              className={`cursor-pointer rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 relative flex flex-col justify-between ${
                selectedMode === 'ACADEMY_AFFILIATED'
                  ? 'border-purple-500 bg-white dark:bg-slate-900 shadow-xl ring-4 ring-purple-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300'
              }`}
            >
              {selectedMode === 'ACADEMY_AFFILIATED' && (
                <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>

                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 mb-1.5">
                    Option B
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Academy Teacher
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Affiliate with accredited academies and teach under institutional credentials.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Search academies & apply for open faculty appointments</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Access academy resources and assigned teaching cohorts</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Syndicate authorized courses under the academy brand</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Your account remains independent; leave anytime without data loss</span>
                  </div>
                </div>

                {/* Affiliation status callout */}
                {approvedMembership ? (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 text-[11px] text-purple-900 dark:text-purple-300">
                    <strong>Active Affiliation:</strong> {approvedMembership.academyName} ({approvedMembership.roleTitle})
                  </div>
                ) : pendingMembership ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-300">
                    <strong>Application Pending:</strong> {pendingMembership.academyName}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400">
                    You can discover and apply to partner academies after saving.
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    selectedMode === 'ACADEMY_AFFILIATED'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {selectedMode === 'ACADEMY_AFFILIATED' ? 'Selected Mode' : 'Select Academy Mode'}
                </button>
              </div>
            </div>

          </div>

          {/* Confirm Button */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Primary Mode Selected: <span className="text-brand-600 dark:text-brand-400 font-extrabold">{selectedMode === 'INDEPENDENT' ? 'Option A (Independent Teacher)' : 'Option B (Academy Teacher)'}</span>
              </div>
              <p className="text-xs text-slate-500">
                You can switch between modes at any time from your studio header.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/teacher/dashboard"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Skip for now
              </Link>

              <button
                onClick={handleConfirm}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>{savedSuccess ? 'Preference Saved!' : 'Confirm & Open Studio'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
