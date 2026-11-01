'use client';

import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Loader2, BookOpen, Layers, ListChecks } from 'lucide-react';
import { generateCourseOutline, AICourseOutline } from '@/lib/ai-service';

interface AICourseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOutline: (outline: AICourseOutline) => void;
}

export default function AICourseGeneratorModal({
  isOpen,
  onClose,
  onApplyOutline,
}: AICourseGeneratorModalProps) {
  const [topic, setTopic] = useState('Full-Stack Distributed Systems with Rust & Go');
  const [level, setLevel] = useState('INTERMEDIATE');
  const [audience, setAudience] = useState('Senior software engineers and systems architects');
  const [loading, setLoading] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<AICourseOutline | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const outline = await generateCourseOutline(topic, level, audience);
      setGeneratedOutline(outline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedOutline) {
      onApplyOutline(generatedOutline);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-indigo-50/40 dark:from-brand-950/40 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Course Generator</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                  Teacher Tool
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate pedagogical modules, lessons, and learning objectives automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!generatedOutline ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Subject or Topic
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Next.js 14 Microfrontends & AI Embeddings"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Skill Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="ALL_LEVELS">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. Frontend developers learning full-stack"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:opacity-95 shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Curriculum & Objectives...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Full Course Syllabus</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              
              {/* Generated Title & Subtitle */}
              <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/50 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Course Proposal
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {generatedOutline.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {generatedOutline.subtitle}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-brand-500" />
                  Key Learning Objectives
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {generatedOutline.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sections & Lessons */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-500" />
                  Curriculum Sections ({generatedOutline.sections.length} Modules)
                </div>
                <div className="space-y-2">
                  {generatedOutline.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2"
                    >
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {sec.title}
                      </div>
                      <div className="space-y-1 pl-3 border-l-2 border-brand-500/40">
                        {sec.lessons.map((les, lidx) => (
                          <div key={lidx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                            <span>{les.title}</span>
                            <span className="text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                              {les.estimatedMinutes}m ({les.type})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        {generatedOutline && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <button
              onClick={() => setGeneratedOutline(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Back to Form
            </button>
            <button
              onClick={handleApply}
              className="py-2.5 px-5 rounded-xl font-semibold text-xs bg-brand-600 text-white hover:bg-brand-700 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>Import into Course Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
