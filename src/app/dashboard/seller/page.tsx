'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { loadState, getCurrentUser } from '@/lib/storage';
import { User, Course, Order } from '@/lib/types';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Star, 
  Plus, 
  TrendingUp, 
  ArrowRight, 
  Edit, 
  Package, 
  FileText,
  User as UserIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SellerDashboardPage() {
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

  // Filter only products belonging to this seller
  const sellerProducts = state.courses.filter(c => 
    c.teacherId === user.id || c.teacherId === 'usr-teacher-sarah' || c.teacherId === 'usr-seller'
  );

  const sellerOrders = state.orders.slice(0, 5); // Simulated seller product orders
  const totalRevenue = sellerProducts.reduce((acc, c) => acc + (c.studentCount * c.priceCents), 0);

  return (
    <ProtectedRoute allowedRole="SELLER" dashboardTitle="Seller Dashboard">
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Seller Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-8 sm:p-10 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-100">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Authorized Merchant &amp; Seller Studio</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Seller Studio: {user.name}
                </h1>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  Publish and manage your proprietary digital products, review buyer orders, monitor sales earnings, and customize your merchant profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/teacher/builder"
                  className="px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-xs shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Product</span>
                </Link>
                <Link
                  href="/profile"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs transition-all flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Edit Seller Profile</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Products</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{sellerProducts.length}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">In store catalog</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Product Sales</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ${(totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">+14.2% this month</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Customers</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {sellerProducts.reduce((acc, c) => acc + c.studentCount, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">Verified buyers</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Seller Rating</div>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5">
                <span>4.9</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Top rated creator</div>
            </div>
          </div>

          {/* Section 1: Manage Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>My Products &amp; Offerings</span>
                </h2>
                <p className="text-xs text-slate-500">Manage pricing, content, and availability for your store</p>
              </div>
              <Link
                href="/teacher/builder"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Product</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sellerProducts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-36 relative bg-slate-100 dark:bg-slate-800">
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-xs">
                        ${(p.priceCents / 100).toFixed(2)}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] text-white font-semibold">
                        {p.status}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {p.subtitle}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>{p.studentCount} sales</span>
                        <span>{p.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <Link
                      href={`/courses/${p.id}`}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold text-center transition-all"
                    >
                      View Live
                    </Link>
                    <Link
                      href="/teacher/builder"
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Manage Product Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Customer Orders on Your Products</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">Financial ledger and fulfillment records for your store</p>

            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Platform Fee (15%)</th>
                    <th className="pb-3 font-semibold">Net Payout</th>
                    <th className="pb-3 font-semibold">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sellerOrders.map((o) => {
                    const gross = o.totalAmountCents / 100;
                    const fee = gross * 0.15;
                    const net = gross - fee;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">{o.id}</td>
                        <td className="py-3 text-slate-900 dark:text-white font-medium">Verified Customer</td>
                        <td className="py-3 font-bold">${gross.toFixed(2)}</td>
                        <td className="py-3 text-slate-400">-${fee.toFixed(2)}</td>
                        <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">${net.toFixed(2)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
