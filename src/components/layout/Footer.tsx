import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Heart, Sparkles, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80 dark:border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-glow">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                U<span className="text-brand-600 dark:text-brand-400">Learn</span> Marketplace
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              The premier commercial educational platform connecting independent educators, students, and academies. Create courses, schedule live classes, and learn with AI assistance.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Instructors
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-brand-500" /> Grounded AI Tutor
              </span>
            </div>
          </div>

          {/* Marketplace Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/courses" className="hover:text-brand-600 transition-colors">All Courses</Link></li>
              <li><Link href="/courses?category=web-development" className="hover:text-brand-600 transition-colors">Web Development</Link></li>
              <li><Link href="/courses?category=ai-machine-learning" className="hover:text-brand-600 transition-colors">AI & Machine Learning</Link></li>
              <li><Link href="/courses?category=cloud-devops" className="hover:text-brand-600 transition-colors">Cloud & DevOps</Link></li>
              <li><Link href="/live" className="hover:text-brand-600 transition-colors">Live Masterclasses</Link></li>
            </ul>
          </div>

          {/* For Educators Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              For Instructors
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/teacher/dashboard" className="hover:text-brand-600 transition-colors">Teacher Studio</Link></li>
              <li><Link href="/teacher/builder" className="hover:text-brand-600 transition-colors">Course Builder</Link></li>
              <li><Link href="/teacher/earnings" className="hover:text-brand-600 transition-colors">Earnings & Ledger</Link></li>
              <li><Link href="/academy/dashboard" className="hover:text-brand-600 transition-colors">Academy Portal</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-brand-600 transition-colors">Platform Admin</Link></li>
            </ul>
          </div>

          {/* Trust & Safety Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><span className="cursor-pointer hover:text-brand-600 transition-colors">Teacher KYC Verification</span></li>
              <li><span className="cursor-pointer hover:text-brand-600 transition-colors">14-Day Refund Guarantee</span></li>
              <li><span className="cursor-pointer hover:text-brand-600 transition-colors">PCI-DSS Safe Payments</span></li>
              <li><span className="cursor-pointer hover:text-brand-600 transition-colors">Certificate Verification</span></li>
              <li><span className="cursor-pointer hover:text-brand-600 transition-colors">Privacy & Security Policies</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} ULearn Marketplace Inc. All rights reserved. Built for commercial scale.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
