'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser, getUserRoleDashboard } from '@/lib/storage';
import { validatePasswordStrength, isValidEmail } from '@/lib/crypto-auth';
import { UserRole } from '@/lib/types';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  Video, 
  Building2, 
  Check, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  GraduationCap,
  Award
} from 'lucide-react';

const ROLE_OPTIONS: {
  role: 'STUDENT' | 'TEACHER' | 'ACADEMY';
  title: string;
  badge: string;
  icon: any;
  color: string;
  bgLight: string;
  description: string;
  features: string[];
}[] = [
  {
    role: 'STUDENT',
    title: 'Student Account',
    badge: 'Individual Learner',
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    description: 'Learn modern tech skills, stream video courses, practice with AI tutor, and earn verified certificates.',
    features: ['Access full course catalog', 'AI study assistant & quizzes', 'Official verified certificates'],
  },
  {
    role: 'TEACHER',
    title: 'Teacher Account',
    badge: 'Instructor & Creator',
    icon: Award,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    description: 'Publish your courses, design curriculum, track student progress, and earn 85% revenue payouts.',
    features: ['Course builder & AI generator', 'Sales ledger & analytics', '85% revenue payouts'],
  },
  {
    role: 'ACADEMY',
    title: 'Academy Account',
    badge: 'Institution & Enterprise',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    description: 'Deliver accredited academic programs, corporate training cohorts, and manage multiple instructors.',
    features: ['Multi-instructor cohorts', 'Accredited campus credentials', 'Corporate team licensing'],
  },
];

function RegisterContent() {
  const router = useRouter();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'ACADEMY'>('STUDENT');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation checks
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a secure password.');
      return;
    }
    if (!passwordStrength.isValid) {
      setErrorMessage(passwordStrength.errors[0] || 'Password does not satisfy security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('You must accept the terms of service to create an account.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await registerUser({
        name: fullName,
        email: email,
        password: password,
        role: selectedRole,
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Failed to complete registration.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Account created successfully as ${selectedRole}! Redirecting to your dashboard...`);
      
      setTimeout(() => {
        const dest = getUserRoleDashboard(res.user!.role);
        router.push(dest);
      }, 1000);

    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Role-Based Authentication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Select your account type to access your specialized workspace, tailored tools, and permissions.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
          
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Step 1: Select Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                1. Select Account Type <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ROLE_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role)}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? `${item.bgLight} border-brand-600 dark:border-brand-500 ring-2 ring-brand-500/20 shadow-md`
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color} bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{item.title}</div>
                        <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-2">{item.badge}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 font-medium">
                        {item.role === 'STUDENT' ? 'Instant Learner Activation' : 'Instructor / Partner Review'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Account Details */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
                2. Your Credentials & Profile Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 h-full rounded-full transition-all ${
                              step <= passwordStrength.score
                                ? passwordStrength.score === 4
                                  ? 'bg-emerald-500'
                                  : passwordStrength.score >= 2
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>Security: {passwordStrength.score === 4 ? 'Strong' : passwordStrength.score >= 2 ? 'Moderate' : 'Weak'}</span>
                        {passwordStrength.errors.length > 0 && (
                          <span className="text-rose-500 font-medium">{passwordStrength.errors[0]}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="terms">
                I agree to the <span className="font-semibold text-slate-900 dark:text-white">Terms of Service</span>, <span className="font-semibold text-slate-900 dark:text-white">Privacy Policy</span>, and role-based marketplace guidelines.
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating &amp; Hashing Account...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Complete {selectedRole} Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Footer switcher */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in to your dashboard
              </Link>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading Registration...</div>}>
      <RegisterContent />
    </React.Suspense>
  );
}
