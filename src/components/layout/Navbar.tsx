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
import { loadState, getCurrentUser, logoutUser, isUserAuthenticated, getUserRoleDashboard } from '@/lib/storage';
import { UserRole } from '@/lib/types';

const getRoleInfo = (role: UserRole) => {
  switch (role) {
    case 'STUDENT':
    case 'MEMBER':
      return {
        label: 'Student',
        dashboardPath: '/my-learning',
        dashboardTitle: 'My Learning',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: GraduationCap,
      };
    case 'TEACHER':
    case 'SELLER':
    case 'COACH':
      return {
        label: 'Teacher',
        dashboardPath: '/teacher/dashboard',
        dashboardTitle: 'Teacher Studio',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: Award,
      };
    case 'ACADEMY':
    case 'ACADEMY_ADMIN':
    case 'BRAND':
      return {
        label: 'Academy',
        dashboardPath: '/academy/dashboard',
        dashboardTitle: 'Academy Portal',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: Building2,
      };
    case 'ADMIN':
      return {
        label: 'Admin',
        dashboardPath: '/admin/dashboard',
        dashboardTitle: 'Admin Console',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: ShieldCheck,
      };
    default:
      return {
        label: 'Student',
        dashboardPath: '/my-learning',
        dashboardTitle: 'My Learning',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: GraduationCap,
      };
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [authenticated, setAuthenticated] = useState(() => isUserAuthenticated(loadState()));
  const [notifications, setNotifications] = useState(() => loadState().notifications);
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

  const handleLogout = () => {
    logoutUser();
    setUser(getCurrentUser(loadState()));
    setAuthenticated(false);
    router.push('/login');
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

          {/* Right Action Elements: Role Badge, Role Dashboard, Notifications, Theme, User Profile, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {authenticated && user ? (
              <>
                {/* Static Read-Only Role Badge (Role determined strictly by authenticated account) */}
                {(() => {
                  const roleInfo = getRoleInfo(user.role);
                  const Icon = roleInfo.icon;
                  return (
                    <div 
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.badgeBg}`}
                      title={`Role: ${roleInfo.label}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <Icon className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                      <span>{roleInfo.label}</span>
                    </div>
                  );
                })()}

                {/* Direct Link to Role Dashboard */}
                {(() => {
                  const roleInfo = getRoleInfo(user.role);
                  const Icon = roleInfo.icon;
                  return (
                    <Link
                      href={roleInfo.dashboardPath}
                      className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all"
                      title={`Open ${roleInfo.dashboardTitle}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{roleInfo.dashboardTitle}</span>
                    </Link>
                  );
                })()}
              </>
            ) : null}

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

            {/* Authenticated Profile & Logout vs Unauthenticated Sign In & Register */}
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
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* User Avatar & Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 pl-0.5 sm:pl-1 group shrink-0"
                  title="View & Edit Profile"
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

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
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
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase">{getRoleInfo(user.role).label} Account</div>
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



          {/* Theme & Extras */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
            {user ? (
              <Link
                href={getRoleInfo(user.role).dashboardPath}
                onClick={() => setShowMobileMenu(false)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>{getRoleInfo(user.role).dashboardTitle}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setShowMobileMenu(false)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
