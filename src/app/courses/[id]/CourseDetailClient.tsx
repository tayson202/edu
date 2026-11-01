'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  Clock, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  FileText, 
  HelpCircle, 
  Award, 
  Download, 
  Lock, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Share2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { loadState, getCourseById, enrollCourse, getCurrentUser } from '@/lib/storage';
import { Course, CourseEnrollment } from '@/lib/types';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const user = getCurrentUser(state);
      const c = getCourseById(state, courseId);
      setCourse(c || null);
      if (c) {
        const enr = state.enrollments.find(e => e.userId === user.id && e.courseId === c.id);
        setEnrollment(enr || null);
        // Expand first section by default
        if (c.sections.length > 0) {
          setExpandedSections({ [c.sections[0].id]: true });
        }
      }
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, [courseId]);

  if (!mounted) return null;

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-center">
        <div className="space-y-4 max-w-md mx-auto p-8 rounded-3xl glass-panel">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Not Found</h2>
          <p className="text-xs text-slate-500">The requested course could not be located in the marketplace catalog.</p>
          <Link href="/courses" className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const toggleSection = (secId: string) => {
    setExpandedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleEnrollConfirm = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      const res = enrollCourse(course.id);
      setCheckoutLoading(false);
      if (res.success) {
        setOrderSuccess(true);
        setTimeout(() => {
          router.push(`/learn/${course.id}`);
        }, 1200);
      }
    }, 1000);
  };

  const isFree = course.isFree || course.priceCents === 0;
  const currentPrice = isFree ? 'Free' : `$${((course.discountPriceCents ?? course.priceCents) / 100).toFixed(2)}`;
  const originalPrice = !isFree && course.discountPriceCents ? `$${(course.priceCents / 100).toFixed(2)}` : null;

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      
      {/* 1. HERO HEADER */}
      <section className="bg-slate-900 text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left 2 Cols: Course Overview */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Category Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/courses" className="hover:text-white">Courses</Link>
                <span>/</span>
                <span className="text-brand-400 font-semibold">{course.categoryName}</span>
                <span>/</span>
                <span className="text-slate-300 uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                  {course.level.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.subtitle || course.description}
              </p>

              {/* Rating & Enrollment Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{course.ratingAvg.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({course.ratingCount} student reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.studentCount} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{Math.round(course.totalDurationSecs / 3600)} hours total content</span>
                </div>
              </div>

              {/* Instructor Tag */}
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={course.teacher.avatarUrl}
                  alt={course.teacher.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <span>Created by {course.teacher.name}</span>
                    {course.teacher.verificationStatus === 'VERIFIED' && (
                      <span title="Verified Instructor" className="inline-flex items-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{course.teacher.headline}</div>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Purchase Box / Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-3xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-6">
                
                {/* Video Preview */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white backdrop-blur-sm">
                    Preview Course
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {currentPrice}
                    </span>
                    {originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {originalPrice}
                      </span>
                    )}
                    {course.discountPriceCents && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {Math.round(((course.priceCents - course.discountPriceCents) / course.priceCents) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 14-Day Money-Back Guarantee
                  </div>
                </div>

                {/* Primary CTA */}
                {enrollment ? (
                  <Link
                    href={`/learn/${course.id}`}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Continue Learning ({enrollment.progressPercent}%)</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 text-white shadow-glow flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{isFree ? 'Enroll for Free' : 'Enroll Now (Instant Sandbox)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Perks Checklist */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                    This course includes:
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-brand-500" />
                    <span>{totalLessons} on-demand video & text lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    <span>Grounded AI Personal Tutor with citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                    <span>Auto-graded quizzes & assessment check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-brand-500" />
                    <span>Verifiable Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>Full lifetime access on desktop & mobile</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BODY CURRICULUM & OBJECTIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-10">
            
            {/* What you'll learn */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span>What you will master in this course</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {course.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {course.sections.length} sections ΓÇó {totalLessons} lessons ΓÇó {Math.round(course.totalDurationSecs / 60)} minutes total
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {course.sections.map((section, sidx) => {
                  const isExpanded = !!expandedSections[section.id];
                  return (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">
                            {sidx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{section.lessons.length} lessons</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 pl-6 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'VIDEO' && <Play className="w-3.5 h-3.5 text-brand-600" />}
                                {lesson.type === 'TEXT' && <FileText className="w-3.5 h-3.5 text-indigo-500" />}
                                {lesson.type === 'QUIZ' && <HelpCircle className="w-3.5 h-3.5 text-purple-500" />}
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {lesson.isFreePreview ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                    Free Preview
                                  </span>
                                ) : (
                                  <Lock className="w-3 h-3 text-slate-400" />
                                )}
                                <span className="text-slate-400 font-mono">
                                  {Math.floor(lesson.durationSecs / 60)}:{(lesson.durationSecs % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Prerequisites & Requirements
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {course.prerequisites.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Instructor Deep-Dive */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                About the Instructor
              </h3>
              <div className="flex items-start gap-4">
                <img
                  src={course.teacher.avatarUrl}
                  alt={course.teacher.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/30"
                />
                <div className="space-y-1">
                  <div className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{course.teacher.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">{course.teacher.headline}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Γÿà {course.teacher.ratingAvg.toFixed(2)} Instructor Rating</span>
                    <span>ΓÇó</span>
                    <span>{course.teacher.studentCount.toLocaleString()} Students</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CHECKOUT MODAL (COMMERCIALLY TRANSPARENT SANDBOX) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Secure Sandbox Checkout
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Confirm Enrollment
              </h3>
              <p className="text-xs text-slate-500">
                Experience the real-time financial ledger calculation in sandbox mode.
              </p>
            </div>

            {/* Course Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
              <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                {course.title}
              </div>
              <div className="text-xs text-slate-500">
                Instructor: {course.teacher.name} ΓÇó Lifetime Access
              </div>
            </div>

            {/* Commercial Fee Transparency Breakdown */}
            <div className="space-y-2 text-xs border-t border-b border-slate-100 dark:border-slate-800 py-3">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Original Price:</span>
                <span className="line-through">{originalPrice || currentPrice}</span>
              </div>
              {course.discountPriceCents && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Marketplace Discount:</span>
                  <span>-${((course.priceCents - course.discountPriceCents) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white pt-1">
                <span>Total Due:</span>
                <span className="text-brand-600 dark:text-brand-400 text-base">{currentPrice}</span>
              </div>

              {/* Platform Ledger Transparency Notice */}
              <div className="mt-3 p-2.5 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 text-[11px] text-brand-900 dark:text-brand-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-600" />
                  <span>Marketplace Ledger Allocation:</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                  <span>Teacher Net Payout (85%):</span>
                  <span className="font-semibold text-emerald-600">
                    ${(((course.discountPriceCents ?? course.priceCents) * 0.85) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                  <span>Platform Fee (15%):</span>
                  <span>${(((course.discountPriceCents ?? course.priceCents) * 0.15) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {orderSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-center space-y-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                <div className="font-bold text-sm">Payment Successful & Enrolled!</div>
                <div className="text-xs">Redirecting to your interactive course player...</div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={handleEnrollConfirm}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-glow disabled:opacity-50 transition-all"
                >
                  {checkoutLoading ? 'Processing Sandbox Transaction...' : 'Confirm & Complete'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
