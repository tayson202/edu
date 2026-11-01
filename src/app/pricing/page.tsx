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
            <span>Fair, Transparent &amp; Scalable Role Tiers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plans for Members, Sellers, Coaches &amp; Brands
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Zero upfront fees for Sellers and Coaches. Pay only when you earn. Comprehensive features for Members and Brand enterprise partners.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan 1: Sellers & Coaches */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <DollarSign className="w-6 h-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Sellers &amp; Coaches
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Seller &amp; Coach Tier</h3>
                <p className="text-xs text-slate-500 mt-1">Sell digital courses, products, and host live 1-on-1 coaching consultations.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  $0 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold">
                  Platform Fee: Only 15% on sales (You keep 85% net)
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited digital products &amp; courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-on-1 coaching booking integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure 4K video hosting &amp; streaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI curriculum &amp; quiz generator tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct ACH, PayPal &amp; Stripe payouts</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/seller"
                className="py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white text-center transition-all shadow-xs"
              >
                Seller Studio
              </Link>
              <Link
                href="/dashboard/coach"
                className="py-3 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white text-center transition-all shadow-xs"
              >
                Coach Portal
              </Link>
            </div>
          </div>

          {/* Plan 2: Member Pro Pass */}
          <div className="p-8 rounded-3xl glass-card border-2 border-brand-500 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-8 relative shadow-glow">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular for Members
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-brand-100 dark:bg-brand-900/60 text-brand-600">
                  <Zap className="w-6 h-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  Members &amp; Learners
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Member Pro Pass</h3>
                <p className="text-xs text-slate-500 mt-1">Unlimited access to premium courses, AI personal tutoring, and certificates.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                  $29 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">Billed annually or $39 month-to-month</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Access all marketplace courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Grounded AI Tutor video transcript citations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive code sandbox &amp; cloud VMs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified digital certificates with serial keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Personal member dashboard &amp; order receipts</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/member"
              className="w-full py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-glow text-center transition-all"
            >
              Open Member Workspace
            </Link>
          </div>

          {/* Plan 3: Brand Partner */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                  <Building2 className="w-6 h-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Brand Partners
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Brand Partner Tier</h3>
                <p className="text-xs text-slate-500 mt-1">Multi-seat team licenses, corporate training lines, and institutional accreditation.</p>
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
                  <span>Verified Brand badge &amp; certified catalog</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Corporate cohort enrollment &amp; team analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom branded certificates &amp; accreditations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated corporate success manager &amp; SLA</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/brand"
              className="w-full py-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm text-center transition-all"
            >
              Open Brand Dashboard
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
