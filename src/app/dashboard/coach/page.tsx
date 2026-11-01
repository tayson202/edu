'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { loadState, getCurrentUser } from '@/lib/storage';
import { User, LiveSession } from '@/lib/types';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  User as UserIcon,
  MessageSquare,
  Sparkles,
  DollarSign
} from 'lucide-react';

export default function CoachDashboardPage() {
  const [state, setState] = useState(() => loadState());
  const [user, setUser] = useState<User>(() => getCurrentUser(loadState()));

  useEffect(() => {
    const sync = () => {
      const s = loadState();
      setState(s);
      setUser(getCurrentUser(s));
    };
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  const coachSessions: LiveSession[] = state.liveSessions;
  const coachProfile = user.coachProfile || {
    specialty: 'Engineering Leadership & High-Scale Systems Mentorship',
    hourlyRateCents: 25000,
    bookingUrl: 'https://calendly.com/marcus-vance-leadership',
    totalClients: 48,
    totalSessionsCompleted: 184,
  };

  return (
    <ProtectedRoute allowedRole="COACH" dashboardTitle="Coach Dashboard">
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Coach Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-900 text-white p-8 sm:p-10 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-100">
                  <Video className="w-3.5 h-3.5" />
                  <span>Authorized Mentor &amp; Coach Workspace</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Coach Workspace: {user.name}
                </h1>
                <p className="text-sm text-amber-100 leading-relaxed">
                  Manage your training programs, 1-on-1 mentorship sessions, client bookings, and personal coach profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/live"
                  className="px-5 py-3 rounded-2xl bg-white text-amber-800 font-bold text-xs shadow-lg hover:bg-amber-50 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Live Session</span>
                </Link>
                <Link
                  href="/profile"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs transition-all flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Edit Coach Profile</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Mentored Clients</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{coachProfile.totalClients}</div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Active client base</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sessions Completed</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{coachProfile.totalSessionsCompleted}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">100% attendance</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hourly Coaching Rate</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ${(coachProfile.hourlyRateCents / 100).toFixed(0)}/hr
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Standard rate</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mentorship Rating</div>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5">
                <span>5.0</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Top tier coach</div>
            </div>
          </div>

          {/* Section 1: Upcoming Coaching Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-600" />
                  <span>My Coaching Programs &amp; Live Sessions</span>
                </h2>
                <p className="text-xs text-slate-500">Upcoming 1-on-1 consultations and cohort coaching calls</p>
              </div>
              <Link
                href="/live"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Session</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coachSessions.map((s) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {s.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        ${(s.priceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {s.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(s.scheduledAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.durationMins} minutes duration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.bookedCount} / {s.maxCapacity} clients booked</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => alert(`Starting Live Video Room for session: ${s.title}`)}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Coaching Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Coaching Subscriptions & Calendar Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Coach Booking Integration &amp; Calendar</span>
            </h2>
            <p className="text-xs text-slate-500">Connected booking calendar for automatic client synchronization</p>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  External Booking URL:
                </div>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                  {coachProfile.bookingUrl || 'https://calendly.com/your-coach-link'}
                </div>
              </div>
              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Change Booking Link
              </Link>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
