'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { loadState, getCurrentUser, isUserAuthenticated, canAccessDashboard, getUserRoleDashboard } from '@/lib/storage';
import { User, UserRole } from '@/lib/types';
import { ShieldAlert, ArrowRight, LogIn, Lock, CheckCircle2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'MEMBER' | 'SELLER' | 'COACH' | 'BRAND' | 'ADMIN';
  dashboardTitle: string;
}

export default function ProtectedRoute({ children, allowedRole, dashboardTitle }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    const isAuth = isUserAuthenticated(state);
    const currentUser = getCurrentUser(state);
    
    setAuthenticated(isAuth);
    setUser(currentUser);

    if (!isAuth) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    const handleStateChange = () => {
      const s = loadState();
      setAuthenticated(isUserAuthenticated(s));
      setUser(getCurrentUser(s));
    };

    window.addEventListener('ulearn_state_changed', handleStateChange);
    return () => window.removeEventListener('ulearn_state_changed', handleStateChange);
  }, [pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying session permissions...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated fallback
  if (!authenticated || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/60">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Please log in with an authorized account to access the <span className="font-semibold text-slate-800 dark:text-slate-200">{dashboardTitle}</span>.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Go to Login Gateway</span>
          </Link>
        </div>
      </div>
    );
  }

  // Role validation
  const hasAccess = canAccessDashboard(user.role, allowedRole);

  if (!hasAccess) {
    const ownDashboard = getUserRoleDashboard(user.role);

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800/60">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-full mb-3">
            Role Permission Denied
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            This workspace is reserved exclusively for <span className="font-bold text-slate-900 dark:text-white">{allowedRole}</span> accounts.
            You are currently authenticated as <span className="font-bold text-brand-600 dark:text-brand-400">{user.name}</span> with the role <span className="font-bold text-slate-900 dark:text-white">{user.role}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={ownDashboard}
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <span>Go to Your {user.role} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user.status === 'PENDING_APPROVAL' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span><strong>Account Pending Approval:</strong> Your business profile has been submitted and is in onboarding/preview mode. Full commercial publishing unlocks upon review.</span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded font-bold">Verification Pending</span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
