'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  User as UserIcon, 
  ChevronDown,
  Menu,
  X,
  Award,
  Video,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { loadState, switchUser, getCurrentUser } from '@/lib/storage';
import { UserRole } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [notifications, setNotifications] = useState(() => loadState().notifications);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncState = () => {
      const state = loadState();
      setUser(getCurrentUser(state));
      setNotifications(state.notifications);
    };

    window.addEventListener('ulearn_state_changed', syncState);
    return () => window.removeEventListener('ulearn_state_changed', syncState);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const updated = switchUser(role);
    setUser(updated);
    setShowRoleMenu(false);

    // Route to appropriate initial dashboard
    if (role === 'STUDENT') router.push('/my-learning');
    else if (role === 'TEACHER') router.push('/teacher/dashboard');
    else if (role === 'ACADEMY_ADMIN') router.push('/academy/dashboard');
    else if (role === 'ADMIN') router.push('/admin/dashboard');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  U<span className="text-brand-600 dark:text-brand-400">Learn</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 ml-1">
                    Market
                  </span>
                </span>
              </div>
            </Link>

            {/* Quick Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                href="/courses" 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/courses' 
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Explore Courses
              </Link>
              <Link 
                href="/live" 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/live' 
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Live Classes
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, skills, or top instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </form>
          </div>

          {/* Right Action Elements: Role Switcher, Notifications, Theme, User */}
          <div className="flex items-center gap-3">
            
            {/* RBAC Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50/80 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition-all shadow-sm"
                title="Switch role to preview role-specific perspectives"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Role: {user.role.replace('_', ' ')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                    Select Active Persona (RBAC)
                  </div>
                  
                  <button
                    onClick={() => handleRoleChange('STUDENT')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'STUDENT' ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="font-medium">Student (Alex Morgan)</div>
                      <div className="text-[11px] text-slate-400">Discover, learn, quizzes, certificates</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('TEACHER')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'TEACHER' ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-medium">Teacher (Dr. Sarah Chen)</div>
                      <div className="text-[11px] text-slate-400">Studio, Course Builder, Payouts, AI</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('ACADEMY_ADMIN')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'ACADEMY_ADMIN' ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Academy (Apex Academy)</div>
                      <div className="text-[11px] text-slate-400">Multi-instructor & cohort management</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('ADMIN')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'ADMIN' ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium">Admin (Elena Vance)</div>
                      <div className="text-[11px] text-slate-400">Ledger, approvals, commission settings</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">{unreadCount} unread</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">{n.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Role-Specific Portal Button */}
            {user.role === 'STUDENT' && (
              <Link
                href="/my-learning"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>My Learning</span>
              </Link>
            )}

            {user.role === 'TEACHER' && (
              <Link
                href="/teacher/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Teacher Studio</span>
              </Link>
            )}

            {user.role === 'ACADEMY_ADMIN' && (
              <Link
                href="/academy/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Academy Hub</span>
              </Link>
            )}

            {user.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Platform Admin</span>
              </Link>
            )}

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-1">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
              />
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link 
              href="/courses" 
              onClick={() => setShowMobileMenu(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              All Courses
            </Link>
            <Link 
              href="/live" 
              onClick={() => setShowMobileMenu(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Live Sessions
            </Link>
            <Link 
              href="/my-learning" 
              onClick={() => setShowMobileMenu(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              My Learning
            </Link>
            <Link 
              href="/teacher/dashboard" 
              onClick={() => setShowMobileMenu(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Teacher Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
