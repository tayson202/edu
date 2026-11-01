'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { loadState, getCurrentUser } from '@/lib/storage';
import { LiveSession } from '@/lib/types';

export default function LiveClassesPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [bookedSessions, setBookedSessions] = useState<Record<string, boolean>>({});
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      setUser(getCurrentUser(state));
      setSessions(state.liveSessions);
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  const handleBookSession = (sessionId: string) => {
    setBookedSessions(prev => ({ ...prev, [sessionId]: true }));
    setBookingSuccess(sessionId);
    setTimeout(() => {
      setBookingSuccess(null);
    }, 3000);
  };

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-bold">
            <Video className="w-3.5 h-3.5" />
            <span>Interactive Real-Time Mentorship</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Upcoming Live Classes & Masterclasses
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Attend live interactive workshops, group debugging sessions, and real-time design critiques with verified instructors.
          </p>
        </div>

        {/* Live Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sessions.map((session) => {
            const isBooked = !!bookedSessions[session.id];
            const remainingSeats = session.maxCapacity - session.bookedCount - (isBooked ? 1 : 0);
            const price = session.priceCents === 0 ? 'Free' : `$${(session.priceCents / 100).toFixed(2)}`;

            return (
              <div
                key={session.id}
                className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                      <span>Scheduled Interactive Workshop</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {remainingSeats} seats remaining
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {session.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {session.description}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-500" />
                      <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span>{session.durationMins} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-500" />
                      <span>Max {session.maxCapacity} participants</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                      <span>{price}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-slate-500">
                    Instructor: <span className="font-semibold text-slate-900 dark:text-white">{session.teacherName}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {bookingSuccess === session.id && (
                    <div className="mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Seat booked successfully! Meeting link confirmed.</span>
                    </div>
                  )}

                  {isBooked ? (
                    <a
                      href={session.meetingUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>Enter Live Room ({session.meetingUrl ? 'Google Meet' : 'Direct'})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleBookSession(session.id)}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Reserve Your Seat ({price})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
