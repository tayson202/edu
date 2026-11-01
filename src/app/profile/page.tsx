'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  loadState, 
  getCurrentUser, 
  updateUserProfile, 
  resetUserToDefault,
  isUserAuthenticated
} from '@/lib/storage';
import { User, UserRole, VerificationStatus } from '@/lib/types';
import { 
  User as UserIcon, 
  GraduationCap, 
  ShieldCheck, 
  Layers, 
  Award, 
  Building2, 
  ShieldAlert, 
  Save, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Key, 
  BookOpen, 
  Flame, 
  Plus, 
  Trash2,
  Lock,
  DollarSign,
  Video,
  Users,
  Clock,
  LogIn
} from 'lucide-react';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Student Profile State
  const [studentInterests, setStudentInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [studentPoints, setStudentPoints] = useState(0);
  const [studentStreak, setStudentStreak] = useState(0);
  const [studentBadges, setStudentBadges] = useState<string[]>([]);
  const [newBadgeInput, setNewBadgeInput] = useState('');

  // Teacher Profile State
  const [teacherExpertise, setTeacherExpertise] = useState<string[]>([]);
  const [newExpertiseInput, setNewExpertiseInput] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [teacherLinkedin, setTeacherLinkedin] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE_CONNECT'>('BANK_TRANSFER');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  // Academy Profile State
  const [academyName, setAcademyName] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [establishedYear, setEstablishedYear] = useState(2020);
  const [totalStudents, setTotalStudents] = useState(0);

  // Admin Profile State
  const [adminDepartment, setAdminDepartment] = useState('');
  const [securityClearance, setSecurityClearance] = useState<'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ROOT_SYSTEM_ADMIN'>('ROOT_SYSTEM_ADMIN');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [auditSignerKey, setAuditSignerKey] = useState('');
  const [autoApproveCeiling, setAutoApproveCeiling] = useState(2000);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Load user data into form
  const populateFormData = (u: User) => {
    setName(u.name || '');
    setEmail(u.email || '');
    setAvatarUrl(u.avatarUrl || '');
    setHeadline(u.headline || '');
    setBio(u.bio || '');
    setPhone(u.phone || '');
    setLocation(u.location || '');
    setWebsiteUrl(u.websiteUrl || '');

    // Student fields
    if (u.studentProfile) {
      setStudentInterests(u.studentProfile.interests || []);
      setStudentPoints(u.studentProfile.learningPoints || 0);
      setStudentStreak(u.studentProfile.streakDays || 0);
      setStudentBadges(u.studentProfile.badges || []);
    } else {
      setStudentInterests(['Artificial Intelligence', 'TypeScript', 'Next.js 14']);
      setStudentPoints(1200);
      setStudentStreak(7);
      setStudentBadges(['Quick Starter', 'Code Explorer']);
    }

    // Teacher fields
    if (u.teacherProfile) {
      setTeacherExpertise(u.teacherProfile.expertise || []);
      setExperienceYears(u.teacherProfile.experienceYears || 5);
      setTeacherLinkedin(u.teacherProfile.linkedinUrl || '');
      setPayoutMethod(u.teacherProfile.payoutConfig?.method || 'BANK_TRANSFER');
      setPayoutDetails(u.teacherProfile.payoutConfig?.accountDetails || '');
      setTotalEarnings(u.teacherProfile.totalEarningsCents ? u.teacherProfile.totalEarningsCents / 100 : 0);
      setPendingBalance(u.teacherProfile.pendingBalanceCents ? u.teacherProfile.pendingBalanceCents / 100 : 0);
    } else {
      setTeacherExpertise(['Full-Stack Engineering', 'Cloud DevOps']);
      setExperienceYears(8);
      setTeacherLinkedin('https://linkedin.com/in/');
      setPayoutMethod('BANK_TRANSFER');
      setPayoutDetails('Primary Business Checking (Account ****1092)');
      setTotalEarnings(2500);
      setPendingBalance(450);
    }

    // Academy fields
    if (u.academyProfile) {
      setAcademyName(u.academyProfile.academyName || '');
      setAccreditation(u.academyProfile.accreditation || '');
      setCampusLocation(u.academyProfile.campusLocation || '');
      setContactEmail(u.academyProfile.contactEmail || '');
      setEstablishedYear(u.academyProfile.establishedYear || 2018);
      setTotalStudents(u.academyProfile.totalStudents || 10000);
    } else {
      setAcademyName('Global Tech Academy');
      setAccreditation('IEEE Technical Partner');
      setCampusLocation('Tech Park, CA');
      setContactEmail('admissions@techacademy.edu');
      setEstablishedYear(2019);
      setTotalStudents(15000);
    }

    // Admin fields
    if (u.adminProfile) {
      setAdminDepartment(u.adminProfile.department || '');
      setSecurityClearance(u.adminProfile.securityClearance || 'ROOT_SYSTEM_ADMIN');
      setEmergencyContact(u.adminProfile.emergencyContact || '');
      setAuditSignerKey(u.adminProfile.auditSignerKey || '');
      setAutoApproveCeiling(u.adminProfile.autoApprovePayoutsUnderCents ? u.adminProfile.autoApprovePayoutsUnderCents / 100 : 2000);
      setTwoFactorEnabled(u.adminProfile.twoFactorEnabled !== false);
    } else {
      setAdminDepartment('Platform Operations & Governance');
      setSecurityClearance('ROOT_SYSTEM_ADMIN');
      setEmergencyContact('ops-security@ulearn.com');
      setAuditSignerKey('UL-SEC-2026-KEY');
      setAutoApproveCeiling(2000);
      setTwoFactorEnabled(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    const isAuth = isUserAuthenticated(state);
    setAuthenticated(isAuth);
    if (isAuth) {
      const curr = getCurrentUser(state);
      setUser(curr);
      populateFormData(curr);
    } else {
      setUser(null);
    }

    const onStateChange = () => {
      const s = loadState();
      const isAuthNow = isUserAuthenticated(s);
      setAuthenticated(isAuthNow);
      if (isAuthNow) {
        const updated = getCurrentUser(s);
        setUser(updated);
        populateFormData(updated);
      } else {
        setUser(null);
      }
    };

    window.addEventListener('ulearn_state_changed', onStateChange);
    return () => window.removeEventListener('ulearn_state_changed', onStateChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const updatedUserPayload: Partial<User> = {
      name,
      email,
      avatarUrl,
      headline,
      bio,
      phone,
      location,
      websiteUrl,
    };

    // Role-specific payload attachments
    if (user.role === 'STUDENT') {
      updatedUserPayload.studentProfile = {
        id: user.studentProfile?.id || `sp-${Date.now()}`,
        userId: user.id,
        headline,
        bio,
        interests: studentInterests,
        learningPoints: Number(studentPoints),
        streakDays: Number(studentStreak),
        badges: studentBadges,
      };
    } else if (user.role === 'TEACHER') {
      updatedUserPayload.teacherProfile = {
        id: user.teacherProfile?.id || `tp-${Date.now()}`,
        userId: user.id,
        user: null as any,
        headline,
        bio,
        expertise: teacherExpertise,
        experienceYears: Number(experienceYears),
        websiteUrl,
        linkedinUrl: teacherLinkedin,
        verificationStatus: user.teacherProfile?.verificationStatus || 'VERIFIED',
        totalEarningsCents: Math.round(Number(totalEarnings) * 100),
        pendingBalanceCents: Math.round(Number(pendingBalance) * 100),
        payoutConfig: {
          method: payoutMethod,
          accountDetails: payoutDetails,
        },
      };
    } else if (user.role === 'ACADEMY_ADMIN') {
      updatedUserPayload.academyProfile = {
        id: user.academyProfile?.id || `ap-${Date.now()}`,
        userId: user.id,
        academyName,
        headline,
        bio,
        accreditation,
        campusLocation,
        websiteUrl,
        contactEmail,
        establishedYear: Number(establishedYear),
        totalStudents: Number(totalStudents),
        verificationStatus: 'VERIFIED',
      };
    } else if (user.role === 'ADMIN') {
      updatedUserPayload.adminProfile = {
        id: user.adminProfile?.id || `adp-${Date.now()}`,
        userId: user.id,
        department: adminDepartment,
        securityClearance,
        emergencyContact,
        auditSignerKey,
        autoApprovePayoutsUnderCents: Math.round(Number(autoApproveCeiling) * 100),
        twoFactorEnabled,
      };
    }

    const saved = updateUserProfile(user.id, updatedUserPayload);
    setUser(saved);
    setIsSaving(false);
    showToast('Profile updated successfully across the entire platform!');
  };

  const handleReset = () => {
    if (!user) return;
    if (confirm(`Reset ${user.name}'s profile to original system defaults?`)) {
      const reset = resetUserToDefault(user.id);
      setUser(reset);
      populateFormData(reset);
      showToast('Profile reset to original default attributes');
    }
  };

  // Tag Helpers
  const addStudentInterest = () => {
    if (newInterestInput.trim() && !studentInterests.includes(newInterestInput.trim())) {
      setStudentInterests([...studentInterests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const removeStudentInterest = (tag: string) => {
    setStudentInterests(studentInterests.filter(t => t !== tag));
  };

  const addStudentBadge = () => {
    if (newBadgeInput.trim() && !studentBadges.includes(newBadgeInput.trim())) {
      setStudentBadges([...studentBadges, newBadgeInput.trim()]);
      setNewBadgeInput('');
    }
  };

  const removeStudentBadge = (b: string) => {
    setStudentBadges(studentBadges.filter(x => x !== b));
  };

  const addTeacherExpertise = () => {
    if (newExpertiseInput.trim() && !teacherExpertise.includes(newExpertiseInput.trim())) {
      setTeacherExpertise([...teacherExpertise, newExpertiseInput.trim()]);
      setNewExpertiseInput('');
    }
  };

  const removeTeacherExpertise = (tag: string) => {
    setTeacherExpertise(teacherExpertise.filter(t => t !== tag));
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 flex items-center gap-2 font-medium text-sm">
          <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          Loading Persona Profile...
        </div>
      </div>
    );
  }

  // Visual Theme mapping based on active role
  const roleThemes: Record<string, any> = {
    MEMBER: {
      title: 'Member Profile',
      tagline: 'Learning Journey, XP, Streaks & Career Trajectory',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      badgeIcon: GraduationCap,
      avatarBorder: 'ring-blue-500/40',
      heroGrad: 'from-blue-600/10 via-indigo-500/5 to-transparent',
      accentColor: 'text-blue-600 dark:text-blue-400',
    },
    STUDENT: {
      title: 'Student Scholar Profile',
      tagline: 'Learning Journey, XP, Streaks & Career Trajectory',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      badgeIcon: GraduationCap,
      avatarBorder: 'ring-blue-500/40',
      heroGrad: 'from-blue-600/10 via-indigo-500/5 to-transparent',
      accentColor: 'text-blue-600 dark:text-blue-400',
    },
    SELLER: {
      title: 'Merchant & Seller Studio Profile',
      tagline: 'Store Catalog, Payout Routing & Merchant Reputation',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badgeIcon: Award,
      avatarBorder: 'ring-emerald-500/40',
      heroGrad: 'from-emerald-600/10 via-teal-500/5 to-transparent',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    TEACHER: {
      title: 'Educator & Creator Studio Profile',
      tagline: 'Instructor Credential, Payout Accounts & Teaching Pedagogy',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badgeIcon: Award,
      avatarBorder: 'ring-emerald-500/40',
      heroGrad: 'from-emerald-600/10 via-teal-500/5 to-transparent',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    COACH: {
      title: 'Master Coach & Mentor Profile',
      tagline: '1-on-1 Consultations, Coaching Programs & Client Scheduling',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badgeIcon: Video,
      avatarBorder: 'ring-amber-500/40',
      heroGrad: 'from-amber-600/10 via-orange-500/5 to-transparent',
      accentColor: 'text-amber-600 dark:text-amber-400',
    },
    BRAND: {
      title: 'Enterprise & Brand Partner Profile',
      tagline: 'Brand Offerings, Corporate Accreditation & Certified Curricula',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      badgeIcon: Building2,
      avatarBorder: 'ring-purple-500/40',
      heroGrad: 'from-purple-600/10 via-pink-500/5 to-transparent',
      accentColor: 'text-purple-600 dark:text-purple-400',
    },
    ACADEMY_ADMIN: {
      title: 'Enterprise Academy Portal Profile',
      tagline: 'Institution Governance, Accreditation & Campus Operations',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      badgeIcon: Building2,
      avatarBorder: 'ring-purple-500/40',
      heroGrad: 'from-purple-600/10 via-pink-500/5 to-transparent',
      accentColor: 'text-purple-600 dark:text-purple-400',
    },
    ADMIN: {
      title: 'Platform Director & Root Security Profile',
      tagline: 'System Governance, Ledger Auditing & Security Clearance',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badgeIcon: ShieldCheck,
      avatarBorder: 'ring-rose-500/40',
      heroGrad: 'from-rose-600/10 via-amber-500/5 to-transparent',
      accentColor: 'text-rose-600 dark:text-rose-400',
    },
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto border border-brand-200 dark:border-brand-800/60 shadow-xs">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 bg-brand-100 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full">
            Guest (Student) Mode
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Active Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            You are currently exploring ULearn as a guest. Please log in or register an account to view and customize your verified profile, track your learning journey, and manage credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/login?redirect=/profile"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm transition-all"
            >
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentTheme = roleThemes[user.role] || roleThemes['MEMBER'];
  const BadgeIcon = currentTheme.badgeIcon || GraduationCap;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/30 animate-slideUp text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Authenticated Role Indicator Bar (Locked to Login) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Authenticated Role:
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentTheme.badgeBg}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{user.role === 'MEMBER' ? 'Student' : user.role === 'SELLER' || user.role === 'COACH' ? 'Teacher' : user.role === 'ACADEMY_ADMIN' || user.role === 'BRAND' ? 'Academy' : user.role.charAt(0) + user.role.slice(1).toLowerCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Role locked to authenticated account. Access other roles by logging into that account.</span>
          </div>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className={`relative pt-8 sm:pt-10 pb-10 sm:pb-12 bg-gradient-to-b ${currentTheme.heroGrad} border-b border-slate-200/80 dark:border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full md:w-auto">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl || user.avatarUrl}
                  alt={user.name}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-xl ring-4 ${currentTheme.avatarBorder} bg-slate-200 dark:bg-slate-800`}
                />
                <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900" title="Account Verified">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate max-w-full">
                    {name || user.name}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentTheme.badgeBg}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl line-clamp-2">
                  {headline || user.headline || currentTheme.tagline}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-full">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{email || user.email}</span>
                  </span>
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {location}
                    </span>
                  )}
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline">
                      <Globe className="w-3.5 h-3.5 shrink-0" /> Website <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 transition-colors"
                title="Reset all values to system seed defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Editor Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: General Persona Details (Editable for every role) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <UserIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>General Information</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Distributed Systems Engineer"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Personal / Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourdomain.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bio / Narrative
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the community about your background..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tailored Role-Specific Panel (Strictly Separated By Role) */}
            <div className="lg:col-span-2 space-y-6">

              {/* ------------------------------------------------------------- */}
              {/* 1. STUDENT / MEMBER ROLE PROFILE PANEL */}
              {/* ------------------------------------------------------------- */}
              {(user.role === 'STUDENT' || user.role === 'MEMBER') && (
                <div className="space-y-6">
                  {/* Student Metrics & Gamification */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Study Streak</div>
                        <div className="text-xl font-bold flex items-center gap-1.5">
                          <span>{studentStreak} Days</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Study Points (XP)</div>
                        <div className="text-xl font-bold">{studentPoints} XP</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Badges Earned</div>
                        <div className="text-xl font-bold">{studentBadges.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Student Academic & Learning Settings */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>Learner Specialization &amp; Learning Tags</span>
                    </h3>

                    {/* Interests Tags */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Focus Areas &amp; Technical Interests
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {studentInterests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                          >
                            <span>{interest}</span>
                            <button
                              type="button"
                              onClick={() => removeStudentInterest(interest)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newInterestInput}
                          onChange={(e) => setNewInterestInput(e.target.value)}
                          placeholder="Add topic (e.g. LangGraph, Docker)..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStudentInterest(); } }}
                        />
                        <button
                          type="button"
                          onClick={addStudentInterest}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Tag
                        </button>
                      </div>
                    </div>

                    {/* Student Badges */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Showcased Badges &amp; Recognitions
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {studentBadges.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                          >
                            <Award className="w-3 h-3" />
                            <span>{badge}</span>
                            <button
                              type="button"
                              onClick={() => removeStudentBadge(badge)}
                              className="text-purple-500 hover:text-purple-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newBadgeInput}
                          onChange={(e) => setNewBadgeInput(e.target.value)}
                          placeholder="Add credential badge..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStudentBadge(); } }}
                        />
                        <button
                          type="button"
                          onClick={addStudentBadge}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Badge
                        </button>
                      </div>
                    </div>

                    {/* Simulation: Points & Streak tuning */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          XP Points Simulation
                        </label>
                        <input
                          type="number"
                          value={studentPoints}
                          onChange={(e) => setStudentPoints(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Current Daily Streak
                        </label>
                        <input
                          type="number"
                          value={studentStreak}
                          onChange={(e) => setStudentStreak(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 2. TEACHER / SELLER ROLE PROFILE PANEL */}
              {/* ------------------------------------------------------------- */}
              {(user.role === 'TEACHER' || user.role === 'SELLER') && (
                <div className="space-y-6">
                  {/* Financial & Earnings Ledger Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Gross Course Sales</div>
                        <div className="text-xl font-bold">${totalEarnings.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Pending Payout Balance</div>
                        <div className="text-xl font-bold">${pendingBalance.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Instructor Rating</div>
                        <div className="text-xl font-bold">4.96 ★</div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Credentials & Payout Config */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Instructor Credentials &amp; Financial Payouts</span>
                    </h3>

                    {/* Expertise Tags */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Instruction Domains &amp; Subject Matter Expertise
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {teacherExpertise.map((exp) => (
                          <span
                            key={exp}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          >
                            <span>{exp}</span>
                            <button
                              type="button"
                              onClick={() => removeTeacherExpertise(exp)}
                              className="text-emerald-500 hover:text-emerald-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newExpertiseInput}
                          onChange={(e) => setNewExpertiseInput(e.target.value)}
                          placeholder="Add domain (e.g. Distributed Systems)..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTeacherExpertise(); } }}
                        />
                        <button
                          type="button"
                          onClick={addTeacherExpertise}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Expertise
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Years of Industry Experience
                        </label>
                        <input
                          type="number"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={teacherLinkedin}
                          onChange={(e) => setTeacherLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    {/* Payout Routing Section */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <span>Teacher Payout Gateway Settings</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Disbursement Provider
                          </label>
                          <select
                            value={payoutMethod}
                            onChange={(e) => setPayoutMethod(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                          >
                            <option value="BANK_TRANSFER">Direct Bank Deposit (ACH / SWIFT)</option>
                            <option value="STRIPE_CONNECT">Stripe Connect Custom</option>
                            <option value="PAYPAL">PayPal Merchant Express</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Account Routing / Receiving Identifier
                          </label>
                          <input
                            type="text"
                            value={payoutDetails}
                            onChange={(e) => setPayoutDetails(e.target.value)}
                            placeholder="Chase ACH / PayPal email"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 3. COACH ROLE PROFILE PANEL */}
              {/* ------------------------------------------------------------- */}
              {user.role === 'COACH' && (
                <div className="space-y-6">
                  {/* Coach Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Mentored Clients</div>
                        <div className="text-xl font-bold">{user.coachProfile?.totalClients || 48}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Completed Sessions</div>
                        <div className="text-xl font-bold">{user.coachProfile?.totalSessionsCompleted || 184}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Hourly Consultation</div>
                        <div className="text-xl font-bold">${((user.coachProfile?.hourlyRateCents || 25000) / 100).toFixed(0)}/hr</div>
                      </div>
                    </div>
                  </div>

                  {/* Coach Mentorship Settings */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Video className="w-4 h-4 text-amber-600" />
                      <span>Coaching Practice &amp; Scheduling Integrations</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Mentorship Specialty
                        </label>
                        <input
                          type="text"
                          defaultValue={user.coachProfile?.specialty || 'Engineering Leadership & High-Scale Systems'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Hourly Rate ($ USD)
                        </label>
                        <input
                          type="number"
                          defaultValue={((user.coachProfile?.hourlyRateCents || 25000) / 100)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Calendar Booking URL (Calendly, Cal.com)
                        </label>
                        <input
                          type="url"
                          defaultValue={user.coachProfile?.bookingUrl || 'https://calendly.com/marcus-vance-leadership'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 4. BRAND / ACADEMY ROLE PROFILE PANEL */}
              {/* ------------------------------------------------------------- */}
              {(user.role === 'ACADEMY_ADMIN' || user.role === 'BRAND') && (
                <div className="space-y-6">
                  {/* Academy Institutional Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Enrolled Cohorts</div>
                        <div className="text-xl font-bold">{totalStudents.toLocaleString()} Students</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Accreditation</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {accreditation}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Academy Status</div>
                        <div className="text-xl font-bold text-emerald-600">Verified Partner</div>
                      </div>
                    </div>
                  </div>

                  {/* Academy Operational Settings */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>Enterprise Academy &amp; Campus Accreditation</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Academy Institution Name
                        </label>
                        <input
                          type="text"
                          value={academyName}
                          onChange={(e) => setAcademyName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Accreditation Body &amp; Certificate Code
                        </label>
                        <input
                          type="text"
                          value={accreditation}
                          onChange={(e) => setAccreditation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Campus / Headquarter Location
                        </label>
                        <input
                          type="text"
                          value={campusLocation}
                          onChange={(e) => setCampusLocation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Admissions &amp; Enterprise Contact Email
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Established Year
                        </label>
                        <input
                          type="number"
                          value={establishedYear}
                          onChange={(e) => setEstablishedYear(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Total Active Trainees
                        </label>
                        <input
                          type="number"
                          value={totalStudents}
                          onChange={(e) => setTotalStudents(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 4. PLATFORM ADMIN ROLE PROFILE PANEL */}
              {/* ------------------------------------------------------------- */}
              {user.role === 'ADMIN' && (
                <div className="space-y-6">
                  {/* Security Clearance & Infrastructure Authority */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Clearance Level</div>
                        <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                          {securityClearance.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Two-Factor Auth</div>
                        <div className="text-sm font-bold text-emerald-600">Active &amp; Enforced</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Payout Auto-Approval</div>
                        <div className="text-sm font-bold">${autoApproveCeiling}</div>
                      </div>
                    </div>
                  </div>

                  {/* Root Security Governance */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Security Governance &amp; Administrative Signing</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Administrative Department
                        </label>
                        <input
                          type="text"
                          value={adminDepartment}
                          onChange={(e) => setAdminDepartment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Security Clearance Class
                        </label>
                        <select
                          value={securityClearance}
                          onChange={(e) => setSecurityClearance(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-semibold text-rose-600 dark:text-rose-400"
                        >
                          <option value="ROOT_SYSTEM_ADMIN">ROOT_SYSTEM_ADMIN (Full Governance)</option>
                          <option value="LEVEL_3">LEVEL_3 (Financial Clearance &amp; Disputes)</option>
                          <option value="LEVEL_2">LEVEL_2 (Instructor Verification &amp; Reviews)</option>
                          <option value="LEVEL_1">LEVEL_1 (Support &amp; Catalog Auditing)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Emergency Operations Hotline / Email
                        </label>
                        <input
                          type="text"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Audit Log Cryptographic Signer Alias
                        </label>
                        <input
                          type="text"
                          value={auditSignerKey}
                          onChange={(e) => setAuditSignerKey(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Auto-Approve Payout Limit ($)
                        </label>
                        <input
                          type="number"
                          value={autoApproveCeiling}
                          onChange={(e) => setAutoApproveCeiling(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-5">
                        <input
                          type="checkbox"
                          id="twoFactorCheckbox"
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor="twoFactorCheckbox" className="font-semibold text-slate-700 dark:text-slate-300">
                          Enforce Hardware / Authenticator 2FA on Ledger Signatures
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save All Profile Changes Action Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Updates persist instantly to local storage and propagate across all platform dashboards.
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>

            </div>

          </div>

        </form>
      </div>

    </div>
  );
}
