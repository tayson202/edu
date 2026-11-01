'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  loadState, 
  getCurrentUser, 
  isUserAuthenticated, 
  loginUser, 
  logoutUser, 
  switchUser 
} from '@/lib/storage';
import { User, UserRole } from '@/lib/types';
import { 
  GraduationCap, 
  Award, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Mail, 
  Lock, 
  LogIn, 
  LogOut, 
  Sparkles, 
  UserCheck, 
  ShieldAlert, 
  BookOpen, 
  Layers, 
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get('role') as UserRole | null;
  const redirectUrl = searchParams.get('redirect') || '';

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Form State
  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');
  const [selectedRole, setSelectedRole] = useState<UserRole>(requestedRole || 'STUDENT');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    setCurrentUser(getCurrentUser(state));
    setAuthenticated(isUserAuthenticated(state));

    const onStateChange = () => {
      const s = loadState();
      setCurrentUser(getCurrentUser(s));
      setAuthenticated(isUserAuthenticated(s));
    };

    window.addEventListener('ulearn_state_changed', onStateChange);
    return () => window.removeEventListener('ulearn_state_changed', onStateChange);
  }, []);

  const getDashboardUrl = (role: UserRole) => {
    if (redirectUrl) return redirectUrl;
    switch (role) {
      case 'STUDENT': return '/my-learning';
      case 'TEACHER': return '/teacher/dashboard';
      case 'ACADEMY_ADMIN': return '/academy/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/courses';
    }
  };

  const handleRoleLogin = (role: UserRole, email: string) => {
    setLoadingRole(role);
    setErrorMessage(null);

    setTimeout(() => {
      const res = loginUser(email, role);
      setLoadingRole(null);
      if (res.success && res.user) {
        router.push(getDashboardUrl(res.user.role));
      } else {
        setErrorMessage(res.error || 'Login failed. Please try again.');
      }
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!customEmail.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const res = loginUser(customEmail.trim(), selectedRole);
    if (res.success && res.user) {
      router.push(getDashboardUrl(res.user.role));
    } else {
      setErrorMessage(res.error || 'Authentication error.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setAuthenticated(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 flex items-center gap-2 text-sm font-medium">
          <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          Loading Authentication Gateway...
        </div>
      </div>
    );
  }

  const roleCredentials = [
    {
      role: 'STUDENT' as UserRole,
      title: 'Student Scholar Portal',
      email: 'student@example.com',
      name: 'Alex Morgan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Verified Student',
      color: 'blue',
      borderClass: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-500',
      bgGrad: 'from-blue-600/10 via-indigo-500/5 to-transparent',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      desc: 'Access your cinema LMS player, lesson notes, study streaks, and AI tutor support.',
      features: ['Interactive Cinema Player', '14-Day Study Streak (1,420 XP)', 'Verified Course Certificates', 'Grounded AI Tutor Spark'],
      targetUrl: '/my-learning',
      icon: GraduationCap,
    },
    {
      role: 'TEACHER' as UserRole,
      title: 'Educator & Creator Studio',
      email: 'teacher@example.com',
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      badge: 'Verified Instructor',
      color: 'emerald',
      borderClass: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500',
      bgGrad: 'from-emerald-600/10 via-teal-500/5 to-transparent',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      desc: 'Author courses, generate syllabus with AI, manage student Q&A, and track gross payouts.',
      features: ['AI Course & Quiz Generator', 'Real-Time Sales Ledger ($4,165)', 'Instant Q&A Code Endorsements', 'Direct Bank ACH Payouts'],
      targetUrl: '/teacher/dashboard',
      icon: Award,
    },
    {
      role: 'ACADEMY_ADMIN' as UserRole,
      title: 'Enterprise Academy Portal',
      email: 'academy@example.com',
      name: 'Apex Academy Admin',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      badge: 'Accredited Academy',
      color: 'purple',
      borderClass: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500',
      bgGrad: 'from-purple-600/10 via-pink-500/5 to-transparent',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      desc: 'Manage multi-instructor rosters, issue institutional credentials, and monitor cohort seat licenses.',
      features: ['Enterprise Seat Licenses', 'Multi-Faculty Management', 'Custom Institutional Syllabus', 'Accredited Degree Verification'],
      targetUrl: '/academy/dashboard',
      icon: Building2,
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Platform Director & Governance',
      email: 'admin@example.com',
      name: 'Elena Vance (Platform Director)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      badge: 'Root Clearance Governance',
      color: 'rose',
      borderClass: 'border-rose-200 dark:border-rose-900/60 hover:border-rose-500',
      bgGrad: 'from-rose-600/10 via-amber-500/5 to-transparent',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      desc: 'Oversee escrow financial ledgers, approve payout claims, set commission rates, and review security logs.',
      features: ['Dynamic Commission Adjuster', 'Teacher Payout Settlement Claims', 'Root Security Clearance (Level 3)', 'Immutable Financial Audit Trail'],
      targetUrl: '/admin/dashboard',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Role-Based Identity &amp; Access Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Sign In to Your Workspace
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            ULearn provides completely isolated, role-separated workspaces. Choose your verified persona below for instant 1-click authentication, or sign in with custom credentials.
          </p>
        </div>

        {/* Requested Role Notice */}
        {requestedRole && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Authentication Required:</strong> Please log in as a <strong>{requestedRole.replace('_', ' ')}</strong> to access that restricted workspace.
              </span>
            </div>
          </div>
        )}

        {/* Active Session Card (If Logged In) */}
        {authenticated && currentUser && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30"
              />
              <div>
                <div className="text-xs text-slate-500 font-medium">Currently Authenticated:</div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={getDashboardUrl(currentUser.role)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Tab Toggle: Demo 1-Click Role Login vs Custom Input */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-5 py-2 rounded-xl transition-all ${
                activeTab === 'demo'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              1-Click Verified Role Logins (Recommended)
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-5 py-2 rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Custom Email &amp; Password
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs text-center max-w-lg mx-auto font-medium">
            {errorMessage}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: 4 ROLE-SEPARATED 1-CLICK AUTH CARDS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleCredentials.map((card) => {
              const Icon = card.icon;
              const isRequested = requestedRole === card.role;
              const isLoading = loadingRole === card.role;

              return (
                <div
                  key={card.role}
                  className={`relative rounded-3xl p-6 bg-white dark:bg-slate-900 border transition-all duration-200 shadow-sm flex flex-col justify-between ${card.borderClass} ${
                    isRequested ? 'ring-2 ring-brand-500 shadow-lg' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-${card.color}-600 dark:text-${card.color}-400`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {card.badge}
                      </span>
                    </div>

                    {/* Role Title & Persona */}
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={card.avatar}
                          alt={card.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {card.name}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                        {card.email}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>

                    {/* Features List */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                      {card.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Login Action */}
                  <div className="pt-6">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleRoleLogin(card.role, card.email)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${card.btnBg} disabled:opacity-50 cursor-pointer`}
                    >
                      {isLoading ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Enter as {card.role === 'ACADEMY_ADMIN' ? 'Academy' : card.role.charAt(0) + card.role.slice(1).toLowerCase()}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: CUSTOM CREDENTIAL INPUT FORM */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'custom' && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold">Sign In With Credentials</h2>
              <p className="text-xs text-slate-500">
                Choose your authorization role and enter your email credentials.
              </p>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Role Workspace
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="STUDENT">Student Scholar Workspace</option>
                  <option value="TEACHER">Educator &amp; Creator Studio</option>
                  <option value="ACADEMY_ADMIN">Enterprise Academy Organization</option>
                  <option value="ADMIN">Platform Director &amp; Governance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Authorize &amp; Enter Workspace</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-400 pt-2">
                Don’t have an account? Pick any of the 4 demo profiles in the top tab to test each role instantly.
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading Login Portal...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
