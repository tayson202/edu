'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { loadState, getCurrentUser } from '@/lib/storage';
import { User, Course } from '@/lib/types';
import { 
  Building2, 
  Package, 
  Users, 
  Award, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  User as UserIcon,
  ShieldCheck,
  Globe,
  Briefcase
} from 'lucide-react';

export default function BrandDashboardPage() {
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

  const brandProfile = user.brandProfile || {
    brandName: 'Apex Enterprise Solutions',
    legalEntityName: 'Apex Education & Technologies Corp',
    industry: 'Enterprise Software & Education',
    officialWebsite: 'https://apexlearning.edu',
    productLinesCount: 14,
    partnershipTier: 'ENTERPRISE',
  };

  const academyProfile = user.academyProfile;
  const brandCourses = state.courses; // Institutional offerings

  return (
    <ProtectedRoute allowedRole="BRAND" dashboardTitle="Brand Dashboard">
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Brand Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-purple-200">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Authorized Enterprise &amp; Brand Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {brandProfile.brandName}
                </h1>
                <p className="text-sm text-purple-200 leading-relaxed">
                  Manage institutional catalog products, verify organizational offers, configure enterprise faculty seats, and maintain your official brand profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/teacher/builder"
                  className="px-5 py-3 rounded-2xl bg-white text-purple-900 font-bold text-xs shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Brand Product</span>
                </Link>
                <Link
                  href="/profile"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs transition-all flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Update Brand Info</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Brand Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Partnership Tier</div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{brandProfile.partnershipTier}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Institutional tier</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Brand Catalog Items</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{brandCourses.length}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Verified offerings</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Enterprise Learners</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {academyProfile?.totalStudents.toLocaleString() || '22,000'}
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">Total enrollments</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Brand Verification</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>Verified</span>
                <ShieldCheck className="w-5 h-5 fill-current" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Corporate credential</div>
            </div>
          </div>

          {/* Section 1: Brand Catalog & Product Lines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span>Official Brand Product Lines &amp; Curricula</span>
                </h2>
                <p className="text-xs text-slate-500">Corporate-certified offerings published under your brand seal</p>
              </div>
              <Link
                href="/teacher/builder"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Curricula</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {brandCourses.slice(0, 3).map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Brand Certified
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        ${(c.priceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {c.subtitle}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span>Total Corporate Enrollments:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{c.studentCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Accreditation:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">IEEE Certified</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <Link
                      href={`/courses/${c.id}`}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs text-center"
                    >
                      View
                    </Link>
                    <Link
                      href="/teacher/builder"
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs text-center"
                    >
                      Configure
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Brand Information Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>Official Brand Entity Information</span>
            </h2>
            <p className="text-xs text-slate-500">Corporate accreditation records and verified legal entity</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Legal Entity</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{brandProfile.legalEntityName}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Industry</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{brandProfile.industry}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Official Website</div>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                  <span>{brandProfile.officialWebsite}</span>
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
