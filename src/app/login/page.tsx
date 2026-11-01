'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  loadState, 
  getCurrentUser, 
  isUserAuthenticated, 
  loginWithCredentials, 
  logoutUser, 
  getUserRoleDashboard,
  resetPassword
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
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Video,
  KeyRound,
  X
} from 'lucide-react';

const QUICK_PERSONAS = [
  {
    role: 'STUDENT' as UserRole,
    name: 'Alex Morgan',
    email: 'student@example.com',
    title: 'Student Account',
    badge: 'Individual Learner',
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    desc: 'Browse catalog, stream courses, practice with AI tutor, track learning.',
  },
  {
    role: 'TEACHER' as UserRole,
    name: 'Dr. Sarah Chen',
    email: 'teacher@example.com',
    title: 'Teacher Account',
    badge: 'Instructor & Creator',
    icon: Award,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    desc: 'Manage courses, student analytics, sales ledger, and 85% payouts.',
  },
  {
    role: 'ACADEMY' as UserRole,
    name: 'Apex Academy Admin',
    email: 'academy@example.com',
    title: 'Academy Account',
    badge: 'Enterprise & Institute',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    desc: 'Campus cohorts, multi-instructor management, accreditation.',
  },
  {
    role: 'ADMIN' as UserRole,
    name: 'Elena Vance',
    email: 'admin@example.com',
    title: 'Admin Account',
    badge: 'Platform Director',
    icon: ShieldCheck,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    desc: 'Platform governance, ledger audits, verification, and security clearance.',
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await loginWithCredentials(email, password, rememberMe);

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${res.user.name}! Redirecting to your ${res.user.role} workspace...`);

      setTimeout(() => {
        const dest = redirectUrl || getUserRoleDashboard(res.user!.role);
        router.push(dest);
      }, 700);

    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
      setSubmitting(false);
    }
  };

  const handleQuickPersonaSelect = (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSubmitting(true);
    setResetStatus(null);

    try {
      const res = await resetPassword(resetEmail, resetNewPassword);
      if (res.success) {
        setResetStatus('Password has been successfully updated! You can now log in.');
        setEmail(resetEmail);
        setPassword(resetNewPassword);
        setTimeout(() => setShowForgotModal(false), 1500);
      } else {
        setResetStatus(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setResetStatus(err.message || 'Error resetting password.');
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">

        {/* Current Active Session Alert */}
        {mounted && authenticated && currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-500"
              />
              <div>
                <div className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                  Active Session: {currentUser.role}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser.name} ({currentUser.email})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={getUserRoleDashboard(currentUser.role)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  logoutUser();
                  setSuccessMessage('Logged out successfully.');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Authentication Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Your role and access permissions are retrieved securely from your account record upon login.
          </p>
        </div>

        {/* Main Grid: Left Demo Presets, Right Login Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Quick Demo Accounts Helper (Left, 5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Quick Role Personas
                </h3>
                <p className="text-[11px] text-slate-500">Click any persona to autofill credentials</p>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                Password: Password123!
              </span>
            </div>

            <div className="space-y-2">
              {QUICK_PERSONAS.map((p) => {
                const Icon = p.icon;
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickPersonaSelect(p.email)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.color} bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{p.title}</span>
                          <span className="text-[10px] font-normal text-slate-400">({p.name})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.email}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">
                      {isSelected ? 'Autofilled' : 'Use'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
              Need a brand new account?{' '}
              <Link href="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                Register here
              </Link>
            </div>
          </div>

          {/* Form Card (Right, 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember me for 7 days</span>
                </label>
                <span className="text-[11px] text-slate-400">Trusted session cookie</span>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Authenticate &amp; Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                New to the platform?{' '}
                <Link href="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                  Create a Student, Teacher, or Academy Account
                </Link>
              </div>

            </form>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Reset Your Account Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email and choose a new password with at least 8 characters.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (min. 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="NewStrongPassword123!"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {resetStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  resetStatus.includes('success')
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                }`}>
                  <span>{resetStatus}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
              >
                {resetSubmitting ? 'Updating Password...' : 'Save New Password & Log In'}
              </button>
            </form>
          </div>
        </div>
      )}

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
