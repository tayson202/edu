'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Play, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Video, 
  Brain, 
  Star,
  Layers,
  TrendingUp,
  X
} from 'lucide-react';
import { loadState, getCourses } from '@/lib/storage';
import { Course } from '@/lib/types';
import CourseCard from '@/components/marketplace/CourseCard';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState(() => loadState().categories);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      setCourses(state.courses);
      setCategories(state.categories);
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/courses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const filteredCourses = selectedCat === 'all'
    ? courses
    : courses.filter(c => c.categoryId === selectedCat);

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-ping" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                The All-in-One Educational Marketplace & AI Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Master High-Impact Skills. <br className="hidden sm:block" />
              <span className="gradient-text">Teach Without Limits.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Connect directly with independent instructors and top academies. Stream interactive lessons, take auto-graded quizzes, attend live masterclasses, and learn with an AI personal tutor.
            </p>

            {/* Search Input Box */}
            <div className="pt-4 max-w-xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-glow">
                <Search className="absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What do you want to learn? (e.g. Next.js, AI, DevOps)"
                  className="w-full pl-10 sm:pl-12 pr-24 sm:pr-32 py-3 sm:py-3.5 text-xs sm:text-base rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Explore
                </button>
              </form>

              {/* Tag suggestions */}
              <div className="flex items-center justify-center gap-2 pt-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">Trending:</span>
                {['Next.js 14', 'Transformer AI', 'Kubernetes', 'Figma Systems', 'Full-Stack'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => router.push(`/courses?search=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/teacher/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Start Teaching & Earn (85% Net)</span>
              </Link>
            </div>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">$4.8M+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paid Out to Independent Instructors</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400">98.4%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Course Satisfaction Rating</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">1,400+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live Tutoring Masterclasses Hosted</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grounded AI Tutor Explanations</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES CATALOG */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
                Curated Marketplace
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Featured Professional Courses
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Taught by verified industry engineers, researchers, and accredited academies.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCat('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Subjects
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCat === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onPreviewClick={(course) => setPreviewCourse(course)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 hover:bg-brand-100 transition-colors"
            >
              <span>Explore All {courses.length}+ Courses in Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM VALUE PILLARS (STUDENTS & INSTRUCTORS) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
              Next-Generation Learning Infrastructure
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Built for Commercial Success & Rigorous Education
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Everything students need to master new competencies, and everything educators need to scale profitable businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1: Grounded AI Tutor */}
            <div className="p-8 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Grounded AI Personal Tutor
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Students receive instant answers strictly grounded in the official course video transcripts with timestamp citations. Zero hallucinations.
              </p>
              <div className="pt-2 text-xs font-semibold text-brand-600 flex items-center gap-1">
                <span>Interactive In-Player Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Dynamic Ledger & Payouts */}
            <div className="p-8 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Transparent Financial Ledger
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Configurable platform commission (keep up to 85% net earnings). Every sale logs immutable gross, fee, and net payouts with instant withdrawal claims.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span>Direct Bank & Stripe Payouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Live Masterclasses & Certifications */}
            <div className="p-8 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Classes & Verified Credentials
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Host group mentoring, 1-on-1 tutoring, and issue cryptographically verifiable certificates upon meeting rigorous 100% curriculum completion criteria.
              </p>
              <div className="pt-2 text-xs font-semibold text-purple-600 flex items-center gap-1">
                <span>Integrated Video & Quizzes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TEACHER ONBOARDING CALLOUT */}
      <section className="py-20 bg-gradient-to-tr from-brand-900 via-brand-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200">
                <Sparkles className="w-3.5 h-3.5" />
                Join Over 1,200+ Verified Educators
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Turn Your Expertise Into an Autonomous Global Business
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                Create unlimited free or paid courses with our drag-and-drop builder, auto-generate quiz question banks with AI, host live video classes, and withdraw your earnings whenever you want.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  href="/teacher/dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-white text-slate-950 hover:bg-slate-100 shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <span>Open Teacher Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/academy/dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-brand-700/60 hover:bg-brand-700 text-white border border-white/10 transition-colors text-center"
                >
                  Register an Organization or Academy
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Transparent Revenue Example
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                  <span className="text-slate-300">Course Price (Paid by Student):</span>
                  <span className="font-bold text-white">$100.00</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                  <span className="text-slate-300">Platform Infrastructure Fee (15%):</span>
                  <span className="font-medium text-rose-300">-$15.00</span>
                </div>
                <div className="flex items-center justify-between text-base py-2 font-bold">
                  <span className="text-brand-200">Teacher Net Earnings (85%):</span>
                  <span className="text-emerald-400 text-lg">$85.00</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-2">
                * Dynamic platform commission configured by platform administration. No hidden hosting, video bandwidth, or per-student fees.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VIDEO PREVIEW MODAL */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="font-bold text-sm truncate max-w-lg">
                Preview: {previewCourse.title}
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={previewCourse.previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Instructor: <span className="text-white font-medium">{previewCourse.teacher.name}</span>
              </div>
              <Link
                href={`/courses/${previewCourse.id}`}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700"
              >
                View Full Curriculum & Enroll
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
