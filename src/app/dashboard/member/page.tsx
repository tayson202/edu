'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { loadState, getCurrentUser } from '@/lib/storage';
import { User, Course, Order } from '@/lib/types';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  ShoppingBag, 
  Clock, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  ExternalLink,
  User as UserIcon,
  Sparkles,
  Search,
  Calendar
} from 'lucide-react';

export default function MemberDashboardPage() {
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

  const enrolledCourses = state.courses.filter(c => 
    state.enrollments.some(e => e.userId === user.id || e.userId === 'usr-student')
  );

  const memberOrders = state.orders.filter(o => o.userId === user.id || o.userId === 'usr-student');
  const certificates = state.certificates.filter(c => c.userId === user.id || c.userId === 'usr-student');

  return (
    <ProtectedRoute allowedRole="MEMBER" dashboardTitle="Member Dashboard">
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Member Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-brand-700 text-white p-8 sm:p-10 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Authorized Member Workspace</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Welcome back, {user.name}
                </h1>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Explore available products, continue your active programs, inspect digital certificates, and manage your member profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Products &amp; Catalog</span>
                </Link>
                <Link
                  href="/profile"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs transition-all flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Edit Member Profile</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Enrolled Programs</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{enrolledCourses.length}</div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">Active curricula</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Orders</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{memberOrders.length}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Verified purchases</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Certificates Earned</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{certificates.length}</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">Credentials awarded</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role Status</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Verified</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Member permissions active</div>
            </div>
          </div>

          {/* Section 1: Enrolled Courses & Digital Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>My Enrolled Products &amp; Programs</span>
                </h2>
                <p className="text-xs text-slate-500">Pick up where you left off in your modules</p>
              </div>
              <Link href="/courses" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                <span>Browse more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="h-40 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white">
                        {c.level}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                        {c.categoryName || 'General Product'}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {c.subtitle}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>Progress</span>
                          <span>68%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/learn/${c.id}`}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Continue Program</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Order History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>Member Orders &amp; Receipts</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">Manage your purchased products and financial invoices</p>

            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {memberOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">{o.id}</td>
                      <td className="py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">${(o.totalAmountCents / 100).toFixed(2)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
