'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Play, 
  Flame, 
  Award, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Video
} from 'lucide-react';
import { loadState, getCurrentUser } from '@/lib/storage';
import { CourseEnrollment, Certificate, LiveBooking, LiveSession } from '@/lib/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyLearningPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'live' | 'certificates'>('in-progress');

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const u = getCurrentUser(state);
      setUser(u);
      setEnrollments(state.enrollments.filter(e => e.userId === u.id));
      setCertificates(state.certificates.filter(c => c.userId === u.id));
      setLiveSessions(state.liveSessions);
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  const inProgress = enrollments.filter(e => e.progressPercent < 100);
  const completed = enrollments.filter(e => e.progressPercent >= 100);

  return (
    <ProtectedRoute allowedRole="STUDENT" dashboardTitle="Student Learning Portal">
      <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. STUDENT PROFILE & GAMIFICATION BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-sm"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Student Account</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Welcome back, {user.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have {inProgress.length} active courses in your learning queue. Keep your momentum going!
              </p>
            </div>
          </div>

          {/* Gamification Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-lg font-extrabold">
                <Flame className="w-5 h-5 fill-current" />
                <span>14</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Day Streak
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/40 text-center">
              <div className="flex items-center justify-center gap-1 text-brand-600 dark:text-brand-400 text-lg font-extrabold">
                <Sparkles className="w-5 h-5" />
                <span>1,420</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Learning Points
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/40 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 text-lg font-extrabold">
                <Award className="w-5 h-5" />
                <span>{certificates.length}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Certificates
              </div>
            </div>

            <Link
              href="/profile"
              className="px-3.5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Edit Scholar Profile & Goals"
            >
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* 2. TAB CONTROLS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'in-progress'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In-Progress ({inProgress.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'completed'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed ({completed.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'live'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Live Sessions ({liveSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'certificates'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Certificates ({certificates.length})
          </button>
        </div>

        {/* 3. TAB CONTENT */}
        
        {/* Tab A: In Progress */}
        {activeTab === 'in-progress' && (
          <div className="space-y-4">
            {inProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgress.map((enr) => (
                  <div
                    key={enr.id}
                    className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-5 space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={enr.course.thumbnailUrl}
                          alt={enr.course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold">
                          {enr.course.categoryName}
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {enr.course.title}
                      </h3>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400">{enr.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${enr.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/learn/${enr.course.id}`}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Course</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Courses in Progress</h4>
                <p className="text-xs text-slate-500">Browse the marketplace to enroll in new skills.</p>
                <Link href="/courses" className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white">
                  Discover Courses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab B: Completed Courses */}
        {activeTab === 'completed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((enr) => (
              <div
                key={enr.id}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    100% Completed
                  </span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{enr.course.title}</h3>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <Link href={`/learn/${enr.course.id}`} className="text-brand-600 font-semibold hover:underline">
                    Review Curriculum
                  </Link>
                  <Link href="/certificates" className="text-amber-500 font-semibold hover:underline flex items-center gap-1">
                    <span>View Certificate</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab C: Live Sessions */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveSessions.map((session) => (
              <div
                key={session.id}
                className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Live Interactive Masterclass</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {session.bookedCount}/{session.maxCapacity} Seats Booked
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{session.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{session.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    <span>{new Date(session.scheduledAt).toLocaleString()} ({session.durationMins} mins)</span>
                  </div>

                  <a
                    href={session.meetingUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm flex items-center gap-1"
                  >
                    <span>Join Class</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab D: Certificates */}
        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-3xl border-2 border-amber-300/60 dark:border-amber-700/50 bg-gradient-to-tr from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Verified Credential
                      </div>
                      <div className="text-xs font-mono text-slate-500">{cert.certificateNo}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Issued {cert.issueDate}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {cert.courseTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Awarded to <span className="font-bold text-slate-900 dark:text-white">{cert.recipientName}</span> by {cert.instructorName}.
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Blockchain-Anchored Signature
                  </span>
                  <button
                    onClick={() => alert(`Certificate verified: ${cert.certificateNo}\nRecipient: ${cert.recipientName}\nCourse: ${cert.courseTitle}`)}
                    className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
                  >
                    View Official Credential
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
