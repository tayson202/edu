'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Clock, 
  X, 
  Edit3, 
  Trash2, 
  UserX, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  Sparkles,
  MapPin,
  GraduationCap,
  Globe,
  Mail,
  Sliders,
  LogOut
} from 'lucide-react';
import { 
  loadState, 
  getCurrentUser, 
  getAcademyMemberships, 
  reviewAcademyJoinRequest, 
  updateTeacherPermissions, 
  removeTeacherFromAcademy, 
  updateAcademyProfile 
} from '@/lib/storage';
import { User, Course, AcademyMembership, AcademyTeacherPermissions } from '@/lib/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AcademyDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [academyProfile, setAcademyProfile] = useState<NonNullable<User['academyProfile']>>({
    id: 'ap-1',
    userId: 'usr-academy',
    academyName: 'Apex Learning Academy',
    headline: 'Enterprise Technical Academy & Professional Institute',
    bio: 'Accredited global learning institute offering immersive software engineering bootcamps and corporate certifications.',
    accreditation: 'IEEE Technical Training & Cloud Alliance Certified',
    campusLocation: 'Boston Innovation District, MA, USA',
    websiteUrl: 'https://apexlearning.edu',
    contactEmail: 'admissions@apexlearning.edu',
    establishedYear: 2018,
    totalStudents: 22000,
    verificationStatus: 'VERIFIED',
    facultyCount: 14,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [memberships, setMemberships] = useState<AcademyMembership[]>([]);
  const [activeTab, setActiveTab] = useState<'FACULTY' | 'APPLICATIONS' | 'CURRICULUM' | 'PROFILE'>('FACULTY');

  // Modal States
  // 1. Review Application Modal
  const [reviewModalData, setReviewModalData] = useState<{
    membership: AcademyMembership;
    decision: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [appRoleTitle, setAppRoleTitle] = useState('');
  const [appPermissions, setAppPermissions] = useState<AcademyTeacherPermissions>({
    canCreateCourses: true,
    canEditAcademyCourses: true,
    canViewStudents: true,
    canManageAssignments: true,
    canHostLiveSessions: true,
  });
  const [appRejectionReason, setAppRejectionReason] = useState('');
  const [appAssignedCourseIds, setAppAssignedCourseIds] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // 2. Edit Permissions Modal
  const [editPermMembership, setEditPermMembership] = useState<AcademyMembership | null>(null);
  const [editPermValues, setEditPermValues] = useState<AcademyTeacherPermissions>({
    canCreateCourses: false,
    canEditAcademyCourses: false,
    canViewStudents: false,
    canManageAssignments: false,
    canHostLiveSessions: false,
  });
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editAssignedCourses, setEditAssignedCourses] = useState<string[]>([]);
  const [submittingPerms, setSubmittingPerms] = useState(false);

  // 3. Remove Teacher Modal
  const [removeMembership, setRemoveMembership] = useState<AcademyMembership | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [submittingRemove, setSubmittingRemove] = useState(false);

  // 4. Edit Academy Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    academyName: '',
    headline: '',
    bio: '',
    accreditation: '',
    campusLocation: '',
    websiteUrl: '',
    contactEmail: '',
  });

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const u = getCurrentUser(state);
      setCurrentUser(u);

      if (u.academyProfile) {
        setAcademyProfile(u.academyProfile);
        setProfileForm({
          academyName: u.academyProfile.academyName,
          headline: u.academyProfile.headline,
          bio: u.academyProfile.bio,
          accreditation: u.academyProfile.accreditation,
          campusLocation: u.academyProfile.campusLocation,
          websiteUrl: u.academyProfile.websiteUrl,
          contactEmail: u.academyProfile.contactEmail,
        });
      }

      // Filter academy courses
      const acadCourses = state.courses.filter(
        c => c.organizationId === u.id || 
             c.organizationId === u.academyProfile?.id || 
             c.academyId === u.academyProfile?.id ||
             (c.isAcademyOwned && c.organizationName === u.academyProfile?.academyName)
      );
      setCourses(acadCourses);

      // Load memberships
      const mems = getAcademyMemberships(u.id, state);
      setMemberships(mems);
    };

    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  const pendingApplications = memberships.filter(m => m.status === 'PENDING');
  const affiliatedFaculty = memberships.filter(m => m.status === 'APPROVED');
  const pastMemberships = memberships.filter(m => m.status === 'REJECTED' || m.status === 'CANCELLED');

  const totalCohortStudents = courses.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  // Open Review Application Modal
  const handleOpenReview = (membership: AcademyMembership, decision: 'APPROVE' | 'REJECT') => {
    setReviewModalData({ membership, decision });
    setAppRoleTitle(membership.roleTitle || 'Senior Instructor');
    setAppPermissions({
      canCreateCourses: true,
      canEditAcademyCourses: true,
      canViewStudents: true,
      canManageAssignments: true,
      canHostLiveSessions: true,
    });
    setAppRejectionReason('');
    setAppAssignedCourseIds(courses.slice(0, 1).map(c => c.id));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reviewModalData) return;

    setSubmittingReview(true);
    reviewAcademyJoinRequest({
      reviewerUserId: currentUser.id,
      membershipId: reviewModalData.membership.id,
      decision: reviewModalData.decision,
      permissions: appPermissions,
      roleTitle: appRoleTitle,
      rejectionReason: appRejectionReason,
      assignedCourseIds: appAssignedCourseIds,
    });

    setSubmittingReview(false);
    setReviewModalData(null);
  };

  // Open Edit Permissions Modal
  const handleOpenEditPerms = (membership: AcademyMembership) => {
    setEditPermMembership(membership);
    setEditPermValues(membership.permissions);
    setEditRoleTitle(membership.roleTitle);
    setEditAssignedCourses(membership.assignedCourseIds || []);
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editPermMembership) return;

    setSubmittingPerms(true);
    updateTeacherPermissions({
      academyUserId: currentUser.id,
      membershipId: editPermMembership.id,
      permissions: editPermValues,
      roleTitle: editRoleTitle,
      assignedCourseIds: editAssignedCourses,
    });

    setSubmittingPerms(false);
    setEditPermMembership(null);
  };

  // Open Remove Teacher Modal
  const handleOpenRemove = (membership: AcademyMembership) => {
    setRemoveMembership(membership);
    setRemoveReason('');
  };

  const handleConfirmRemove = () => {
    if (!currentUser || !removeMembership) return;

    setSubmittingRemove(true);
    removeTeacherFromAcademy({
      academyUserId: currentUser.id,
      membershipId: removeMembership.id,
      reason: removeReason || 'Roster restructuring',
    });

    setSubmittingRemove(false);
    setRemoveMembership(null);
  };

  // Save Academy Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateAcademyProfile(currentUser.id, profileForm);
    setShowProfileModal(false);
  };

  return (
    <ProtectedRoute allowedRole="ACADEMY" dashboardTitle="Academy Portal">
      <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Academy & Enterprise Governance Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{academyProfile.academyName}</span>
              <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </h1>
            <p className="text-xs text-slate-500">
              Manage multi-instructor faculty rosters, review incoming join applications, configure granular clearances, and oversee syndicated curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/academies/${currentUser?.id || academyProfile.id}`}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Directory Page</span>
            </Link>

            <button
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Edit Academy Profile</span>
            </button>

            <Link
              href="/teacher/builder"
              className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Academy Course</span>
            </Link>
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Affiliated Faculty</div>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {affiliatedFaculty.length}
            </div>
            <div className="text-[11px] text-slate-500">Active verified teaching staff</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Applications</div>
            <div className="text-3xl font-extrabold text-amber-500">
              {pendingApplications.length}
            </div>
            <div className="text-[11px] text-slate-500">Awaiting administrative decision</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academy Courses</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {courses.length}
            </div>
            <div className="text-[11px] text-slate-500">Syndicated under academy brand</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Cohort Students</div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalCohortStudents.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Across active academy tracks</div>
          </div>
        </div>

        {/* 3. NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('FACULTY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'FACULTY'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Affiliated Faculty Roster</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'FACULTY' ? 'bg-purple-700' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {affiliatedFaculty.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'APPLICATIONS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Teacher Applications</span>
            {pendingApplications.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono animate-pulse">
                {pendingApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('CURRICULUM')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'CURRICULUM'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Academy Courses & Curriculum</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'CURRICULUM' ? 'bg-purple-700' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'PROFILE'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Institution Profile & Governance</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: AFFILIATED FACULTY ROSTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'FACULTY' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Faculty Members</h2>
                  <p className="text-xs text-slate-500">
                    Teachers authorized to deliver instruction, grade assignments, and syndicate curriculum under {academyProfile.academyName}.
                  </p>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {affiliatedFaculty.length} Active Instructors
                </div>
              </div>

              {affiliatedFaculty.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Instructor</th>
                        <th className="py-3 px-4">Faculty Role</th>
                        <th className="py-3 px-4">Clearance Permissions</th>
                        <th className="py-3 px-4">Assigned Courses</th>
                        <th className="py-3 px-4">Affiliated Since</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {affiliatedFaculty.map((fac) => (
                        <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={fac.teacherAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                                alt={fac.teacherName}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                  {fac.teacherName}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {fac.teacherEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-purple-600 dark:text-purple-400">
                            {fac.roleTitle}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {fac.permissions.canCreateCourses && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  Create
                                </span>
                              )}
                              {fac.permissions.canEditAcademyCourses && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                  Edit
                                </span>
                              )}
                              {fac.permissions.canViewStudents && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                  Students
                                </span>
                              )}
                              {fac.permissions.canManageAssignments && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                  Grading
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                            {(fac.assignedCourseIds?.length || 0)} courses
                          </td>
                          <td className="py-4 px-4 text-slate-500">
                            {new Date(fac.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditPerms(fac)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold hover:border-purple-300 hover:text-purple-600"
                            >
                              Permissions
                            </button>
                            <button
                              onClick={() => handleOpenRemove(fac)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Affiliated Faculty Members</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Approve incoming teacher applications in the Applications tab to build your institutional roster.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: INCOMING TEACHER APPLICATIONS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'APPLICATIONS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Incoming Teacher Applications</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review requests from independent educators to affiliate with your academy and assign custom permissions.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full">
                  {pendingApplications.length} Pending
                </span>
              </div>

              {pendingApplications.length > 0 ? (
                <div className="p-6 space-y-4">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-purple-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={app.teacherAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={app.teacherName}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{app.teacherName}</span>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                {app.roleTitle}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {app.teacherEmail} • {app.teacherHeadline}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Review Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenReview(app, 'REJECT')}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleOpenReview(app, 'APPROVE')}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Assign Permissions</span>
                          </button>
                        </div>
                      </div>

                      {app.applicationMessage && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Note:</span>
                          <p className="italic leading-relaxed">"{app.applicationMessage}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">All Applications Reviewed</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    There are no pending teacher join requests at this time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ACADEMY COURSES & CURRICULUM */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'CURRICULUM' && (
          <div className="space-y-6 animate-fade-in">
            {/* Notice of Independent Course Protection */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white">Curriculum Isolation & Ownership Rule:</span>
                <p className="text-[11px] text-slate-500">
                  Academies have governance strictly over institutional courses. An academy cannot view, modify, or seize independent courses owned by teachers.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Academy-Owned Programs</h2>
                  <p className="text-xs text-slate-500">
                    Courses syndicated under the {academyProfile.academyName} brand.
                  </p>
                </div>
                <Link
                  href="/teacher/builder"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Course</span>
                </Link>
              </div>

              {courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Course Name</th>
                        <th className="py-3 px-4">Instructor</th>
                        <th className="py-3 px-4">Level</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Enrolled Cohort</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {courses.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            {c.title}
                          </td>
                          <td className="py-4 px-4 text-purple-600 dark:text-purple-400 font-semibold">
                            {c.teacher.name}
                          </td>
                          <td className="py-4 px-4 text-slate-500">
                            {c.level}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {c.isFree ? 'Free' : `$${((c.discountPriceCents ?? c.priceCents) / 100).toFixed(2)}`}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                            {c.studentCount} students
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <Link
                              href={`/courses/${c.id}`}
                              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                            >
                              Preview
                            </Link>
                            <Link
                              href="/teacher/builder"
                              className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                            >
                              Edit Syllabus
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Academy Courses Published Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Publish course programs to syndicate corporate training across your faculty.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: PROFILE & INSTITUTION GOVERNANCE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Institutional Details</h2>
                  <p className="text-xs text-slate-500">Official information shown in the public academy directory.</p>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Academy Name:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{academyProfile.academyName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Accreditation:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{academyProfile.accreditation}</div>
                </div>
                <div>
                  <span className="text-slate-500">Campus Location:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{academyProfile.campusLocation}</div>
                </div>
                <div>
                  <span className="text-slate-500">Contact Email:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{academyProfile.contactEmail}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Institutional Headline:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{academyProfile.headline}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Institutional Bio:</span>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{academyProfile.bio}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODAL 1: REVIEW APPLICATION & ASSIGN PERMISSIONS */}
        {/* ------------------------------------------------------------- */}
        {reviewModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {reviewModalData.decision === 'APPROVE' ? 'Approve Teacher Application' : 'Decline Teacher Application'}
                  </h3>
                  <p className="text-xs text-slate-500">Applicant: {reviewModalData.membership.teacherName}</p>
                </div>
                <button
                  onClick={() => setReviewModalData(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewModalData.decision === 'APPROVE' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Assigned Faculty Role / Title
                      </label>
                      <input
                        type="text"
                        value={appRoleTitle}
                        onChange={(e) => setAppRoleTitle(e.target.value)}
                        className="w-full px-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Permissions Toggles */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-bold text-slate-900 dark:text-white">
                        Assign Granular Clearances & Permissions
                      </label>

                      <div className="space-y-2 text-xs">
                        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                          <span>Can Author & Syndicate Courses</span>
                          <input
                            type="checkbox"
                            checked={appPermissions.canCreateCourses}
                            onChange={(e) => setAppPermissions({ ...appPermissions, canCreateCourses: e.target.checked })}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                          <span>Can Edit Assigned Academy Courses</span>
                          <input
                            type="checkbox"
                            checked={appPermissions.canEditAcademyCourses}
                            onChange={(e) => setAppPermissions({ ...appPermissions, canEditAcademyCourses: e.target.checked })}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                          <span>Can View Enrolled Student Progress</span>
                          <input
                            type="checkbox"
                            checked={appPermissions.canViewStudents}
                            onChange={(e) => setAppPermissions({ ...appPermissions, canViewStudents: e.target.checked })}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                          <span>Can Grade Assignments & Quizzes</span>
                          <input
                            type="checkbox"
                            checked={appPermissions.canManageAssignments}
                            onChange={(e) => setAppPermissions({ ...appPermissions, canManageAssignments: e.target.checked })}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                          <span>Can Host Live Masterclasses</span>
                          <input
                            type="checkbox"
                            checked={appPermissions.canHostLiveSessions}
                            onChange={(e) => setAppPermissions({ ...appPermissions, canHostLiveSessions: e.target.checked })}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Reason for Decision (Sent to Applicant)
                    </label>
                    <textarea
                      rows={3}
                      value={appRejectionReason}
                      onChange={(e) => setAppRejectionReason(e.target.value)}
                      placeholder="e.g. Current cohort requirements are filled; we welcome your reapplication next semester."
                      className="w-full px-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalData(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-md ${
                      reviewModalData.decision === 'APPROVE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submittingReview ? 'Processing...' : reviewModalData.decision === 'APPROVE' ? 'Confirm Approval' : 'Confirm Decline'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 2: EDIT TEACHER PERMISSIONS */}
        {/* ------------------------------------------------------------- */}
        {editPermMembership && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adjust Faculty Permissions</h3>
                  <p className="text-xs text-slate-500">{editPermMembership.teacherName}</p>
                </div>
                <button
                  onClick={() => setEditPermMembership(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePermissions} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Role Title
                  </label>
                  <input
                    type="text"
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">
                    Clearances
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <span>Can Author Courses</span>
                    <input
                      type="checkbox"
                      checked={editPermValues.canCreateCourses}
                      onChange={(e) => setEditPermValues({ ...editPermValues, canCreateCourses: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <span>Can Edit Assigned Academy Courses</span>
                    <input
                      type="checkbox"
                      checked={editPermValues.canEditAcademyCourses}
                      onChange={(e) => setEditPermValues({ ...editPermValues, canEditAcademyCourses: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <span>Can View Enrolled Students</span>
                    <input
                      type="checkbox"
                      checked={editPermValues.canViewStudents}
                      onChange={(e) => setEditPermValues({ ...editPermValues, canViewStudents: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <span>Can Manage Assignments & Quizzes</span>
                    <input
                      type="checkbox"
                      checked={editPermValues.canManageAssignments}
                      onChange={(e) => setEditPermValues({ ...editPermValues, canManageAssignments: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditPermMembership(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPerms}
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    {submittingPerms ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 3: REMOVE TEACHER CONFIRMATION */}
        {/* ------------------------------------------------------------- */}
        {removeMembership && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <UserX className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Remove {removeMembership.teacherName} from Academy?
                </h3>
                <p className="text-xs text-slate-500">
                  This will revoke their institutional teaching permissions for {academyProfile.academyName}.
                </p>
              </div>

              {/* Requirement 3 Guarantee */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Teacher Account Preservation</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Removing a teacher from an academy does <strong>not</strong> delete their user account or independent courses. Their personal creator studio and earnings remain intact.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Removal (Optional)
                </label>
                <input
                  type="text"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="e.g. End of contract term"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRemoveMembership(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={submittingRemove}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {submittingRemove ? 'Removing...' : 'Confirm Removal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 4: EDIT ACADEMY PROFILE */}
        {/* ------------------------------------------------------------- */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Academy Profile</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academy Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.academyName}
                    onChange={(e) => setProfileForm({ ...profileForm, academyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Accreditation Credential
                  </label>
                  <input
                    type="text"
                    value={profileForm.accreditation}
                    onChange={(e) => setProfileForm({ ...profileForm, accreditation: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.campusLocation}
                      onChange={(e) => setProfileForm({ ...profileForm, campusLocation: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.contactEmail}
                      onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.websiteUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio / Mission
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
