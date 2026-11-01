'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Share2, 
  ArrowLeft, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { loadState, getCurrentUser } from '@/lib/storage';
import { Certificate } from '@/lib/types';

export default function CertificatesPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const u = getCurrentUser(state);
      setUser(u);
      setCertificates(state.certificates.filter(c => c.userId === u.id));
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <Link
            href="/my-learning"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Learning</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Verified Credentials & Certificates</span>
            <Award className="w-7 h-7 text-amber-500" />
          </h1>
          <p className="text-xs text-slate-500">
            Official proof of competence issued upon 100% completion of course curriculum and passing assessment scores.
          </p>
        </div>

        {/* Certificate Display */}
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border-4 border-double border-amber-300 dark:border-amber-700/60 shadow-2xl relative overflow-hidden space-y-8 text-center"
          >
            {/* Top Watermark Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-2 text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">ULearn Marketplace</div>
                  <div className="text-[10px] text-slate-400">Accredited Digital Certificate Authority</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400">CERTIFICATE SERIAL</div>
                <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{cert.certificateNo}</div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 py-4">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Official Certificate of Mastery & Completion
              </div>

              <div className="text-xs text-slate-500">This certifies that</div>

              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
                {cert.recipientName}
              </div>

              <div className="text-xs text-slate-500 max-w-lg mx-auto">
                has successfully fulfilled all curriculum requirements, objective assessments, and capstone practical projects for
              </div>

              <div className="text-xl sm:text-2xl font-bold text-brand-700 dark:text-brand-300 max-w-2xl mx-auto">
                {cert.courseTitle}
              </div>
            </div>

            {/* Signatures & Verification Stamp */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="text-left space-y-1">
                <div className="font-serif italic text-base text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-700 pb-1">
                  {cert.instructorName}
                </div>
                <div className="text-[10px] text-slate-400">Authorized Lead Instructor</div>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div className="w-14 h-14 rounded-full border-2 border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Verified Authenticity
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-700 pb-1">
                  {cert.issueDate}
                </div>
                <div className="text-[10px] text-slate-400">Date of Award</div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download / Print Credential (PDF)</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(cert.verifyUrl);
                  alert(`Verification URL copied to clipboard: ${cert.verifyUrl}`);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Credential Link</span>
              </button>
            </div>
          </div>
        ))}

        {certificates.length === 0 && (
          <div className="p-16 text-center rounded-3xl glass-panel space-y-3">
            <Award className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-500">
              Complete 100% of your course lessons and quizzes in "My Learning" to unlock your official verified certificate!
            </p>
            <Link href="/my-learning" className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white">
              Go to My Learning
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
