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

          {/* For Roles & Creators Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Role Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/dashboard/member" className="hover:text-brand-600 transition-colors">Member Workspace</Link></li>
              <li><Link href="/dashboard/seller" className="hover:text-brand-600 transition-colors">Seller Studio</Link></li>
              <li><Link href="/dashboard/coach" className="hover:text-brand-600 transition-colors">Coach Portal</Link></li>
              <li><Link href="/dashboard/brand" className="hover:text-brand-600 transition-colors">Brand Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-brand-600 transition-colors font-bold text-brand-600 dark:text-brand-400">+ Register Account</Link></li>
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

        {/* Developer Spotlight Section */}
        <div className="my-10 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 px-3.5 py-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-indigo-400/30 shrink-0">
                YT
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Youssef Tamer</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Lead Developer &amp; Architect
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                  Software &amp; AI-Native Developer specializing in intelligent full-stack systems, Kotlin, Flutter, and modern web architectures.
                </p>
              </div>
            </div>

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://tayson202.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
              </a>

              <a
                href="https://wa.me/201203598649"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.059-1.146-.073-.309-.091-.71-.247-1.215-.466-2.136-.925-3.528-3.111-3.635-3.253-.106-.143-.867-1.154-.867-2.199 0-1.045.548-1.56.744-1.774.195-.214.425-.268.566-.268.14 0 .283.003.407.01.13.007.304-.049.475.362.177.427.606 1.48.659 1.589.054.108.09.236.018.379-.072.144-.108.233-.216.357-.107.125-.226.279-.323.375-.108.107-.221.224-.095.44.127.216.565.932 1.213 1.509.833.742 1.535.972 1.751 1.08.216.107.344.09.472-.054.129-.144.551-.643.699-.863.147-.221.295-.184.496-.11.201.074 1.275.601 1.494.71.219.11.365.163.418.255.053.093.053.539-.091.944z"/>
                </svg>
                <span>WhatsApp</span>
              </a>

              <a
                href="https://instagram.com/yousseftamer951?xtok=MThsOWU4ZnpoYnBtNQ%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white shadow-sm transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.linkedin.com/in/youssef-tamer-169827248"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0A66C2] hover:bg-[#004182] text-white shadow-sm transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>© {new Date().getFullYear()} ULearn Marketplace Inc. Built &amp; engineered by</span>
            <a
              href="https://tayson202.github.io/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 underline decoration-brand-500/40 underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              <span>Youssef Tamer</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </a>
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
