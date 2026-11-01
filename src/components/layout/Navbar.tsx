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
  LogIn,
  LogOut,
  UserCheck,
  ArrowRight,
  Moon,
  Sun
} from 'lucide-react';
import { loadState, switchUser, getCurrentUser, logoutUser, isUserAuthenticated, getUserRoleDashboard } from '@/lib/storage';
import { UserRole } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [authenticated, setAuthenticated] = useState(() => isUserAuthenticated(loadState()));
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
      setAuthenticated(isUserAuthenticated(state));
      setNotifications(state.notifications);
    };

    window.addEventListener('ulearn_state_changed', syncState);
    return () => window.removeEventListener('ulearn_state_changed', syncState);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const updated = switchUser(role);
    setUser(updated);
    setShowRoleMenu(false);
    router.push(getUserRoleDashboard(role));
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  U<span className="text-brand-600 dark:text-brand-400">Learn</span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 ml-0.5 sm:ml-1">
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Dedicated Role Login Gateway Button - desktop & tablet */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-xs"
              title="Role-Based Authentication Gateway"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Role Login</span>
            </Link>
            
            {/* RBAC Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50/80 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition-all shadow-sm"
                title="Switch active role"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="hidden md:inline">Role: </span>
                <span className="text-[11px] sm:text-xs font-bold">{user.role.replace('_', ' ')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                    Select Active Persona (4 Core Roles)
                  </div>
                  
                  <button
                    onClick={() => handleRoleChange('MEMBER')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'MEMBER' || user.role === 'STUDENT' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Member (Alex Morgan)</div>
                      <div className="text-[11px] text-slate-400">Browse products, enroll, manage orders</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('SELLER')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'SELLER' || user.role === 'TEACHER' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium">Seller (Dr. Sarah Chen)</div>
                      <div className="text-[11px] text-slate-400">Products, orders, revenue, payouts</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('COACH')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'COACH' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Video className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-medium">Coach (Marcus Vance)</div>
                      <div className="text-[11px] text-slate-400">1-on-1 coaching, subscriptions, calendar</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('BRAND')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'BRAND' || user.role === 'ACADEMY_ADMIN' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Brand (Apex Enterprise)</div>
                      <div className="text-[11px] text-slate-400">Brand catalog, corporate offerings</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('ADMIN')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      user.role === 'ADMIN' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <div>
                      <div className="font-medium">Admin (Elena Vance)</div>
                      <div className="text-[11px] text-slate-400">Governance & approvals</div>
                    </div>
                  </button>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs px-2 pb-1">
                    <Link
                      href="/register"
                      onClick={() => setShowRoleMenu(false)}
                      className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                    >
                      + Register Role
                    </Link>
                    <button
                      onClick={() => {
                        logoutUser();
                        setShowRoleMenu(false);
                        router.push('/login');
                      }}
                      className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
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

            {/* Authenticated Role Portal Button vs Unauthenticated Login/Register */}
            {!authenticated ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden xs:inline-flex px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                {(user.role === 'MEMBER' || user.role === 'STUDENT') && (
                  <Link
                    href="/dashboard/member"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Member Workspace</span>
                  </Link>
                )}

                {(user.role === 'SELLER' || user.role === 'TEACHER') && (
                  <Link
                    href="/dashboard/seller"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Seller Studio</span>
                  </Link>
                )}

                {user.role === 'COACH' && (
                  <Link
                    href="/dashboard/coach"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-xs transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Coach Portal</span>
                  </Link>
                )}

                {(user.role === 'BRAND' || user.role === 'ACADEMY_ADMIN') && (
                  <Link
                    href="/dashboard/brand"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Brand Portal</span>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Platform Admin</span>
                  </Link>
                )}

                {/* User Avatar & Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 pl-0.5 sm:pl-1 group shrink-0"
                  title="View & Edit Role Profile"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-brand-500/20 group-hover:ring-brand-500 transition-all"
                  />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
              </>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {showMobileMenu ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-8 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, skills, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </form>

          {/* Quick Persona / Auth Banner */}
          {authenticated ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase">{user.role.replace('_', ' ')} Account</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setShowMobileMenu(false);
                    router.push('/login');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link 
                  href={getUserRoleDashboard(user.role)}
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Dashboard</span>
                </Link>
                <Link 
                  href="/profile" 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/login" 
                onClick={() => setShowMobileMenu(false)}
                className="p-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link 
                href="/register" 
                onClick={() => setShowMobileMenu(false)}
                className="p-3 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Main Navigation Links */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Explore Platform
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/courses"
                onClick={() => setShowMobileMenu(false)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  pathname === '/courses'
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>Courses</span>
              </Link>
              <Link
                href="/live"
                onClick={() => setShowMobileMenu(false)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  pathname === '/live'
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>Live Classes</span>
              </Link>
              <Link
                href="/community"
                onClick={() => setShowMobileMenu(false)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  pathname === '/community'
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Community</span>
              </Link>
              <Link
                href="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  pathname === '/pricing'
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Pricing</span>
              </Link>
            </div>
          </div>

          {/* 4 Core Role Dashboards */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Role Workspaces
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link 
                href="/dashboard/member" 
                onClick={() => setShowMobileMenu(false)}
                className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Member Area</span>
              </Link>
              <Link 
                href="/dashboard/seller" 
                onClick={() => setShowMobileMenu(false)}
                className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seller Studio</span>
              </Link>
              <Link 
                href="/dashboard/coach" 
                onClick={() => setShowMobileMenu(false)}
                className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2"
              >
                <Video className="w-3.5 h-3.5 text-amber-600" />
                <span>Coach Portal</span>
              </Link>
              <Link 
                href="/dashboard/brand" 
                onClick={() => setShowMobileMenu(false)}
                className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Brand Portal</span>
              </Link>
            </div>
          </div>

          {/* Quick Persona Switcher for Instant Testing on Mobile */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Switch Active Persona (4 Core Roles)
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['MEMBER', 'SELLER', 'COACH', 'BRAND'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    handleRoleChange(r);
                    setShowMobileMenu(false);
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all ${
                    user.role === r
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Extras */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
            <Link
              href="/teacher/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Teacher Studio</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
