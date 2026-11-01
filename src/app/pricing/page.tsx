'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, ShieldCheck, DollarSign, ArrowRight, Zap, Building2, User } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fair, Transparent & Scalable Monetization</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plans for Creators, Students & Academies
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Zero upfront fees for independent teachers. Pay only when you earn. Comprehensive features for students and enterprise institutions.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan 1: Independent Teacher */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
                  <User className="w-6 h-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Independent Creators
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Marketplace</h3>
                <p className="text-xs text-slate-500 mt-1">Start teaching and building your business with zero upfront cost.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  $0 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold">
                  Platform Fee: Only 15% on paid course sales (You keep 85%)
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited free and paid courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure 4K video hosting & streaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Course & Quiz generator tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Live class scheduling & booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct ACH, PayPal & Stripe payouts</span>
                </li>
              </ul>
            </div>

            <Link
              href="/teacher/dashboard"
              className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 text-center transition-all"
            >
              Start Teaching Free
            </Link>
          </div>

          {/* Plan 2: Student Pro Pass */}
          <div className="p-8 rounded-3xl glass-card border-2 border-brand-500 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-8 relative shadow-glow">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular for Learners
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-brand-100 dark:bg-brand-900/60 text-brand-600">
                  <Zap className="w-6 h-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  Students & Professionals
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Pro Pass</h3>
                <p className="text-xs text-slate-500 mt-1">Unlimited access to premium courses, AI tutoring, and certificates.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                  $29 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <div className="text-xs text-slate-500">Cancel or pause subscription anytime</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full access to 500+ curated tech courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Grounded AI Tutor queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified digital certificates with serial keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive quizzes & auto-grading</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Priority access to live classes</span>
                </li>
              </ul>
            </div>

            <Link
              href="/courses"
              className="w-full py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-glow text-center transition-all"
            >
              Start 7-Day Free Trial
            </Link>
          </div>

          {/* Plan 3: Academy & Enterprise */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                  <Building2 className="w-6 h-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Academies & Bootcamps
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Organization Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">Multi-instructor management, cohort analytics, and white-labeling.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  $199 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <div className="text-xs text-purple-600 font-semibold">Preferential 12% commission tier</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited faculty & instructor seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cohort management & bulk enrollment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Enterprise analytics & compliance export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom subdomains & branded certificates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated account manager & SLA</span>
                </li>
              </ul>
            </div>

            <Link
              href="/academy/dashboard"
              className="w-full py-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm text-center transition-all"
            >
              Open Academy Workspace
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
