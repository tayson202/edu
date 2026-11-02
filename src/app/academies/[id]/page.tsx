'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Briefcase, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Sparkles, 
  Star,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { 
  loadState, 
  getAcademyById, 
  getCurrentUser, 
  isUserAuthenticated, 
  submitAcademyJoinRequest, 
  getTeacherMemberships 
} from '@/lib/storage';
import { User, Course, AcademyMembership, AcademyOpportunity } from '@/lib/types';
import CourseCard from '@/components/marketplace/CourseCard';

export default function AcademyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const academyId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [academy, setAcademy] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [memberships, setMemberships] = useState<AcademyMembership[]>([]);
  const [activeFaculty, setActiveFaculty] = useState<AcademyMembership[]>([]);

  // Join Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<AcademyOpportunity | null>(null);
  const [proposedRole, setProposedRole] = useState('Senior Instructor');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const acad = getAcademyById(academyId, state);
      setAcademy(acad || null);

      const u = getCurrentUser(state);
      setCurrentUser(u);
      setAuthenticated(isUserAuthenticated(state));

      if (acad) {
        // Find academy courses
        const acadCourses = state.courses.filter(
          c => c.organizationId === acad.id || 
               c.organizationId === acad.academyProfile?.id || 
               c.academyId === acad.academyProfile?.id
        );
        setCourses(acadCourses);

        // Find active faculty members
        const faculty = (state.memberships || []).filter(
          m => (m.academyUserId === acad.id || m.academyId === acad.academyProfile?.id) && m.status === 'APPROVED'
        );
        setActiveFaculty(faculty);
      }

      if (u) {
        setMemberships(getTeacherMemberships(u.id, state));
      }
    };

    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, [academyId]);

  if (!mounted) return null;

  if (!academy || !academy.academyProfile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academy Not Found</h2>
          <p className="text-xs text-slate-500">The institution you are looking for does not exist or has been modified.</p>
          <Link
            href="/academies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Academy Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const prof = academy.academyProfile;
  const isTeacher = currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'SELLER' || currentUser.role === 'COACH');
  const isAcademyAdmin = currentUser && currentUser.id === academy.id;

  // Check if current teacher has a relationship with this academy
  const userMembership = memberships.find(
    m => (m.academyId === prof.id || m.academyUserId === academy.id)
  );

  const handleOpenJoinModal = (opportunity?: AcademyOpportunity) => {
    if (opportunity) {
      setSelectedOpportunity(opportunity);
      setProposedRole(opportunity.title);
      setApplicationMessage(`Applying for the ${opportunity.title} role in the ${opportunity.department} department. I specialize in...`);
    } else {
      setSelectedOpportunity(null);
      setProposedRole('Adjunct Faculty Member');
      setApplicationMessage('I would like to apply to join your academy faculty roster. My expertise includes...');
    }
    setFeedback(null);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!applicationMessage.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a brief statement or cover message with your application.' });
      return;
    }

    setSubmitting(true);
    const res = submitAcademyJoinRequest({
      teacherId: currentUser.id,
      academyId: academy.id,
      roleTitle: proposedRole,
      applicationMessage: applicationMessage.trim(),
    });

    setSubmitting(false);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to submit join application.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: 'Your join request has been successfully submitted! The academy administrator will review your application and assign teaching permissions.'
    });

    setTimeout(() => {
      setShowJoinModal(false);
    }, 2000);
  };

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back Link */}
        <Link
          href="/academies"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Academies</span>
        </Link>

        {/* 1. HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Cover Header */}
          <div className="h-56 sm:h-72 w-full relative bg-slate-800">
            <img
              src={prof.coverImageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&auto=format&fit=crop&q=80'}
              alt={prof.academyName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            {/* Accreditation Badge */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{prof.accreditation}</span>
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <img
                  src={academy.avatarUrl}
                  alt={prof.academyName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white dark:border-slate-900 object-cover shadow-xl bg-white shrink-0"
                />
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{prof.academyName}</span>
                    <span title="Verified Institution">
                      <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </span>
                  </h1>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {prof.headline}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {prof.campusLocation}
                    </span>
                    <span>•</span>
                    <span>Established {prof.establishedYear}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(prof.totalStudents || 0).toLocaleString()} Active Students
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons / Membership Status */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {isAcademyAdmin ? (
                  <Link
                    href="/academy/dashboard"
                    className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Manage Academy Dashboard</span>
                  </Link>
                ) : userMembership?.status === 'APPROVED' ? (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Affiliated Faculty ({userMembership.roleTitle})</span>
                    </span>
                    <Link
                      href="/teacher/dashboard"
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
                    >
                      Faculty Studio
                    </Link>
                  </div>
                ) : userMembership?.status === 'PENDING' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Application Submitted (Pending Review)</span>
                  </div>
                ) : isTeacher ? (
                  <button
                    onClick={() => handleOpenJoinModal()}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:opacity-95 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Join Academy Faculty</span>
                  </button>
                ) : (
                  <Link
                    href="/login?redirect=/academies"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-700 flex items-center gap-1.5"
                  >
                    <span>Log in as Teacher to Apply</span>
                  </Link>
                )}

                {prof.websiteUrl && (
                  <a
                    href={prof.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Official Portal</span>
                  </a>
                )}
              </div>
            </div>

            {/* Department tags */}
            {prof.departments && (
              <div className="pt-6 flex flex-wrap gap-2">
                {prof.departments.map(d => (
                  <span
                    key={d}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. MAIN LAYOUT: TWO COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: About, Curriculum, Faculty */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Institution Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>About {prof.academyName}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {prof.bio}
              </p>
            </div>

            {/* Teaching Opportunities */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <span>Open Faculty Appointments & Opportunities</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore available teaching and curriculum syndication positions offered by this academy.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full">
                  {prof.openOpportunities?.length || 0} Open
                </span>
              </div>

              {prof.openOpportunities && prof.openOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {prof.openOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-purple-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{opp.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                            <span className="font-semibold text-purple-600 dark:text-purple-400">{opp.department}</span>
                            <span>•</span>
                            <span>{opp.location}</span>
                            <span>•</span>
                            <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded uppercase font-bold text-slate-700 dark:text-slate-300">
                              {opp.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {opp.compensation && (
                          <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl shrink-0">
                            {opp.compensation}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {opp.description}
                      </p>

                      {opp.requirements && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Requirements:</span>
                          <ul className="text-xs text-slate-500 space-y-0.5 list-disc list-inside">
                            {opp.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {isTeacher && userMembership?.status !== 'APPROVED' && userMembership?.status !== 'PENDING' && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleOpenJoinModal(opp)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <span>Apply for This Role</span>
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No formal external postings at this time. General applications are accepted below.</p>
              )}
            </div>

            {/* Academy Courses */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>Academy Curriculum & Programs</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curriculum and training courses published or syndicated under {prof.academyName}.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{courses.length} Courses</span>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">No public courses published under this academy yet.</p>
              )}
            </div>

          </div>

          {/* RIGHT 1 COLUMN: Verified Faculty Roster & Academy Meta */}
          <div className="space-y-6">
            
            {/* Faculty Roster */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Affiliated Faculty Roster</span>
                </h3>
                <span className="text-[11px] font-bold text-purple-600">{activeFaculty.length} Instructors</span>
              </div>

              {activeFaculty.length > 0 ? (
                <div className="space-y-3">
                  {activeFaculty.map((fac) => (
                    <div
                      key={fac.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800"
                    >
                      <img
                        src={fac.teacherAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={fac.teacherName}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                          <span>{fac.teacherName}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </div>
                        <div className="text-[11px] text-purple-600 font-semibold truncate">
                          {fac.roleTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {fac.teacherHeadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No public faculty roster available.</p>
              )}
            </div>

            {/* Quick Contact & Verification */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Governance</h3>
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contact Email:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{prof.contactEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Accreditation:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{prof.accreditation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Campus Status:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Active Verified Institution</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 3. JOIN ACADEMY MODAL */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply to Join Academy</h3>
                    <p className="text-xs text-slate-500">{prof.academyName}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedback && (
                <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}>
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Applying Teacher
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img
                      src={currentUser?.avatarUrl}
                      alt={currentUser?.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser?.name}</div>
                      <div className="text-[11px] text-slate-500">{currentUser?.email} • Verified Educator</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Proposed Role / Title
                  </label>
                  <input
                    type="text"
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    placeholder="e.g. Lead AI Instructor, Senior Cloud Lecturer"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Application Note / Pitch
                  </label>
                  <textarea
                    rows={4}
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Explain your instructional background, areas of expertise, and curriculum topics you wish to teach under this academy..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Independent Account Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    Joining an academy associates you with institutional programs while keeping your teacher account and independent courses 100% separate. You can leave at any time.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending Application...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
