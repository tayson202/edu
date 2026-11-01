'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Video, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Layers, 
  Clock, 
  DollarSign, 
  Eye,
  Check
} from 'lucide-react';
import { loadState, saveCourse, getCurrentUser } from '@/lib/storage';
import { Course, CourseSection, Lesson, Category } from '@/lib/types';
import AICourseGeneratorModal from '@/components/ai/AICourseGeneratorModal';

export default function CourseBuilderPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser(loadState()));
  const [categories, setCategories] = useState<Category[]>(() => loadState().categories);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form States
  const [title, setTitle] = useState('Full-Stack Distributed Systems Masterclass');
  const [subtitle, setSubtitle] = useState('Build resilient, high-throughput systems with modern event streams and microservices.');
  const [description, setDescription] = useState('A hands-on, enterprise-grade engineering course covering high concurrency, message queues, and zero-downtime rollouts.');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-web');
  const [level, setLevel] = useState<'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [isFree, setIsFree] = useState(false);
  const [priceCents, setPriceCents] = useState(7900); // $79.00
  const [discountPriceCents, setDiscountPriceCents] = useState(4900); // $49.00
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  // Objectives & Prerequisites
  const [learningObjectives, setLearningObjectives] = useState<string[]>([
    'Architect fault-tolerant distributed event buses',
    'Implement consensus algorithms and partition-tolerant databases',
    'Enforce zero-trust security and end-to-end encryption in flight',
  ]);
  const [newObj, setNewObj] = useState('');

  // Curriculum Sections
  const [sections, setSections] = useState<CourseSection[]>([
    {
      id: 'sec-1',
      courseId: 'temp',
      title: 'Module 1: Foundations of Distributed Concurrency',
      orderIndex: 0,
      lessons: [
        {
          id: 'les-1',
          sectionId: 'sec-1',
          title: '1. Mental Models for High-Scale Systems',
          type: 'VIDEO',
          durationSecs: 900,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          isFreePreview: true,
          orderIndex: 0,
        },
        {
          id: 'les-2',
          sectionId: 'sec-1',
          title: '2. Reading: CAP Theorem & Consistency Models',
          type: 'TEXT',
          durationSecs: 600,
          textContent: 'In depth analysis of linearizability vs sequential consistency.',
          isFreePreview: false,
          orderIndex: 1,
        },
      ],
    },
  ]);

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    setUser(getCurrentUser(state));
    setCategories(state.categories);
  }, []);

  if (!mounted) return null;

  const handleAddObjective = () => {
    if (newObj.trim()) {
      setLearningObjectives(prev => [...prev, newObj.trim()]);
      setNewObj('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSection = () => {
    const newSection: CourseSection = {
      id: `sec-${Date.now()}`,
      courseId: 'temp',
      title: `Module ${sections.length + 1}: New Curriculum Topic`,
      orderIndex: sections.length,
      lessons: [],
    };
    setSections(prev => [...prev, newSection]);
  };

  const handleAddLesson = (sectionId: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        const newLesson: Lesson = {
          id: `les-${Date.now()}`,
          sectionId,
          title: `Lesson ${sec.lessons.length + 1}: New Video Lesson`,
          type: 'VIDEO',
          durationSecs: 720,
          isFreePreview: false,
          orderIndex: sec.lessons.length,
        };
        return { ...sec, lessons: [...sec.lessons, newLesson] };
      }
      return sec;
    }));
  };

  const handleSave = (publish: boolean) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name || 'General';
    const totalDurationSecs = sections.reduce(
      (acc, s) => acc + s.lessons.reduce((lacc, l) => lacc + l.durationSecs, 0),
      0
    );

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      teacherId: user.id,
      teacher: {
        id: user.id,
        name: user.name,
        headline: 'Verified Creator',
        avatarUrl: user.avatarUrl,
        ratingAvg: 5.0,
        studentCount: 0,
        verificationStatus: 'VERIFIED',
      },
      categoryId,
      categoryName,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subtitle,
      description,
      thumbnailUrl,
      previewVideoUrl,
      level,
      language: 'English',
      priceCents: isFree ? 0 : priceCents,
      discountPriceCents: isFree ? undefined : discountPriceCents,
      isFree,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      prerequisites: ['Basic software engineering fundamentals'],
      learningObjectives,
      totalDurationSecs,
      ratingAvg: 5.0,
      ratingCount: 0,
      studentCount: 0,
      publishedAt: publish ? new Date().toISOString() : undefined,
      sections,
    };

    saveCourse(newCourse);
    setSaveSuccess(true);
    setTimeout(() => {
      router.push('/teacher/dashboard');
    }, 1200);
  };

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/teacher/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Teacher Studio</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Course Builder & Curriculum Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIGenerator(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm flex items-center gap-1.5 hover:opacity-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate with AI</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Save Draft
            </button>

            <button
              onClick={() => handleSave(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Publish Course</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Course saved and catalog updated successfully! Redirecting to studio...</span>
          </div>
        )}

        {/* 1. BASIC DETAILS CARD */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Course Overview</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Course Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="ALL_LEVELS">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. PRICING & COMMERCIAL COMMISSIONS */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Pricing & Monetization</h2>
              <p className="text-xs text-slate-500">Configure retail price and optional promotional discount.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Offer this course for Free</span>
            </label>
          </div>

          {!isFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Standard Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={priceCents / 100}
                    onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Discounted / Sale Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={discountPriceCents / 100}
                    onChange={(e) => setDiscountPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Commission Calculator Preview */}
          {!isFree && (
            <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 text-xs text-brand-900 dark:text-brand-300 flex items-center justify-between">
              <span>Platform Fee (15%): -${((discountPriceCents * 0.15) / 100).toFixed(2)}</span>
              <span className="font-extrabold text-emerald-600">
                Your Estimated Net Earning: ${((discountPriceCents * 0.85) / 100).toFixed(2)} per student
              </span>
            </div>
          )}
        </div>

        {/* 3. DYNAMIC CURRICULUM SECTIONS & LESSONS */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Structure</h2>
              <p className="text-xs text-slate-500">Organize content into modular sections and video/text lessons.</p>
            </div>
            <button
              onClick={handleAddSection}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module / Section</span>
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, sidx) => (
              <div
                key={section.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {sidx + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSections(prev => prev.map(s => s.id === section.id ? { ...s, title: val } : s));
                      }}
                      className="flex-1 font-bold text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 py-1 focus:outline-none focus:border-brand-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setSections(prev => prev.filter(s => s.id !== section.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Lessons List in Section */}
                <div className="space-y-2 pl-4 border-l-2 border-brand-500/30">
                  {section.lessons.map((lesson, lidx) => (
                    <div
                      key={lesson.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {lesson.type === 'VIDEO' ? <Video className="w-4 h-4 text-brand-500" /> : <FileText className="w-4 h-4 text-indigo-500" />}
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections(prev => prev.map(s => {
                              if (s.id === section.id) {
                                return {
                                  ...s,
                                  lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, title: val } : l),
                                };
                              }
                              return s;
                            }));
                          }}
                          className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lesson.isFreePreview}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSections(prev => prev.map(s => {
                                if (s.id === section.id) {
                                  return {
                                    ...s,
                                    lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, isFreePreview: checked } : l),
                                  };
                                }
                                return s;
                              }));
                            }}
                            className="rounded text-brand-600 focus:ring-brand-500"
                          />
                          <span>Free Preview</span>
                        </label>
                        <button
                          onClick={() => {
                            setSections(prev => prev.map(s => {
                              if (s.id === section.id) {
                                return { ...s, lessons: s.lessons.filter(l => l.id !== lesson.id) };
                              }
                              return s;
                            }));
                          }}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddLesson(section.id)}
                    className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50/50 dark:hover:bg-brand-950/20 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson to this Section</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Outline Import Modal */}
      <AICourseGeneratorModal
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onApplyOutline={(outline) => {
          setTitle(outline.title);
          setSubtitle(outline.subtitle);
          setLearningObjectives(outline.learningObjectives);
          setSections(outline.sections.map((s, idx) => ({
            id: `sec-${Date.now()}-${idx}`,
            courseId: 'temp',
            title: s.title,
            orderIndex: idx,
            lessons: s.lessons.map((l, lidx) => ({
              id: `les-${Date.now()}-${idx}-${lidx}`,
              sectionId: `sec-${Date.now()}-${idx}`,
              title: l.title,
              type: l.type,
              durationSecs: l.estimatedMinutes * 60,
              isFreePreview: lidx === 0,
              orderIndex: lidx,
            })),
          })));
        }}
      />
    </div>
  );
}
