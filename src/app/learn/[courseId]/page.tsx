'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Circle, 
  Award, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Send, 
  Download, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Menu, 
  X,
  Share2,
  AlertCircle
} from 'lucide-react';
import { 
  loadState, 
  getCourseById, 
  updateLessonProgress, 
  submitQuiz, 
  getCurrentUser,
  enrollCourse 
} from '@/lib/storage';
import { Course, Lesson, CourseEnrollment, Quiz } from '@/lib/types';
import AITutorDrawer from '@/components/ai/AITutorDrawer';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'assignment'>('content');
  
  // Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // AI Tutor Drawer
  const [showAITutor, setShowAITutor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; scorePercent: number } | null>(null);

  // Assignment State
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const user = getCurrentUser(state);
      const c = getCourseById(state, courseId);
      if (!c) return;
      setCourse(c);

      let enr = state.enrollments.find(e => e.userId === user.id && e.courseId === c.id);
      if (!enr) {
        // Auto-enroll for seamless testing experience if not already enrolled
        const res = enrollCourse(c.id);
        enr = res.enrollment;
      }
      setEnrollment(enr || null);

      // Select first lesson if none active
      if (!activeLesson && c.sections[0]?.lessons[0]) {
        setActiveLesson(c.sections[0].lessons[0]);
      }
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, [courseId]);

  // Video Time Update & Debounced Progress Save
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeLesson || !course) return;
    const time = Math.floor(videoRef.current.currentTime);
    setCurrentTime(time);

    // Save playback position periodically
    if (time % 5 === 0) {
      updateLessonProgress(course.id, activeLesson.id, false, time, time);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current || !activeLesson || !enrollment) return;
    setDuration(videoRef.current.duration);

    // Resume from last position if saved
    const saved = enrollment.lessonProgress[activeLesson.id];
    if (saved && saved.lastPosition > 0 && saved.lastPosition < videoRef.current.duration - 5) {
      videoRef.current.currentTime = saved.lastPosition;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveTab('content');
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleToggleComplete = (lessonId: string) => {
    if (!course || !enrollment) return;
    const current = enrollment.lessonProgress[lessonId]?.isCompleted ?? false;
    const updated = updateLessonProgress(course.id, lessonId, !current, activeLesson?.durationSecs || 300);
    if (updated) setEnrollment(updated);
  };

  const handleQuizSubmit = (quiz: Quiz) => {
    const res = submitQuiz(quiz, selectedAnswers);
    setQuizResult({ passed: res.passed, scorePercent: res.scorePercent });
    if (res.passed && activeLesson && course) {
      handleToggleComplete(activeLesson.id);
    }
  };

  if (!mounted || !course) return null;

  const currentQuiz = course.quizzes && course.quizzes[0];
  const currentAssignment = course.assignments && course.assignments[0];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
      
      {/* 1. TOP LEARNING BAR */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Course Details"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="truncate max-w-md">
            <span className="text-xs text-brand-400 font-medium">{course.categoryName}</span>
            <h1 className="text-sm font-bold text-white truncate">{course.title}</h1>
          </div>
        </div>

        {/* Center/Right stats & AI Drawer trigger */}
        <div className="flex items-center gap-4">
          
          {/* Progress Percentage */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Course Progress</div>
              <div className="text-xs font-bold text-emerald-400">
                {enrollment?.progressPercent ?? 0}% Complete
              </div>
            </div>
            <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${enrollment?.progressPercent ?? 0}%` }}
              />
            </div>
          </div>

          {/* AI Tutor Button */}
          <button
            onClick={() => setShowAITutor(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Certificate Action if 100% */}
          {enrollment && enrollment.progressPercent >= 100 && (
            <Link
              href="/certificates"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Claim Certificate</span>
            </Link>
          )}

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Toggle curriculum drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. PLAYER & CURRICULUM MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Video / Lesson Player Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          
          {/* Video Player */}
          {activeLesson?.type === 'VIDEO' && (
            <div className="relative aspect-video max-h-[65vh] w-full bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={activeLesson.videoUrl || course.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => activeLesson && handleToggleComplete(activeLesson.id)}
                className="w-full h-full object-contain"
              />

              {/* Floating Center Play Button */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              )}
            </div>
          )}

          {/* Text Lesson View */}
          {activeLesson?.type === 'TEXT' && (
            <div className="max-w-3xl mx-auto w-full p-8 space-y-6">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-brand-400 font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Reading Module • Estimated 10 mins</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {activeLesson.textContent}
              </div>
            </div>
          )}

          {/* Lesson Sub-Nav Tabs & Controls */}
          <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'content' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lesson Overview
              </button>
              {currentQuiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'quiz' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Module Quiz</span>
                </button>
              )}
              {currentAssignment && (
                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'assignment' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Assignment</span>
                </button>
              )}
            </div>

            {/* Mark Completed Toggle */}
            {activeLesson && (
              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  enrollment?.lessonProgress[activeLesson.id]?.isCompleted
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                    : 'bg-white text-slate-900 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {enrollment?.lessonProgress[activeLesson.id]?.isCompleted
                    ? 'Completed (Click to Undo)'
                    : 'Mark Lesson as Complete'}
                </span>
              </button>
            )}
          </div>

          {/* Sub-tab Dynamic Content: Quiz or Assignment or Overview */}
          <div className="p-6 max-w-4xl">
            
            {/* 1. Overview Tab */}
            {activeTab === 'content' && activeLesson && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">{activeLesson.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeLesson.textContent || 'Watch the video lesson above carefully. Complete the quiz and assignment to earn course points and unlock your verified certificate.'}
                </p>

                {/* Attachments */}
                {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Downloadable Resources:</div>
                    {activeLesson.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-brand-400 hover:text-white cursor-pointer mr-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{att.name} ({att.fileSizeMb} MB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Interactive Quiz Runner Tab */}
            {activeTab === 'quiz' && currentQuiz && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Interactive Assessment
                  </div>
                  <h3 className="text-lg font-bold text-white">{currentQuiz.title}</h3>
                  <p className="text-xs text-slate-400">
                    Passing score: {currentQuiz.passingScore}% • Time Limit: {currentQuiz.timeLimitMins} mins
                  </p>
                </div>

                {/* Question List */}
                <div className="space-y-6">
                  {currentQuiz.questions.map((q, qidx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="font-semibold text-xs text-white flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-900 text-purple-200 text-[10px] flex items-center justify-center shrink-0">
                          {qidx + 1}
                        </span>
                        <span>{q.prompt}</span>
                      </div>

                      <div className="space-y-2 pl-7">
                        {q.options.map((opt) => (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                              selectedAnswers[q.id] === opt.id
                                ? 'bg-purple-950/60 border-purple-500 text-white font-medium'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={selectedAnswers[q.id] === opt.id}
                              onChange={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                              className="accent-purple-600"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}
                      </div>

                      {quizResult && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400">
                          <span className="font-semibold text-purple-400">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Evaluation Feedback */}
                {quizResult && (
                  <div className={`p-4 rounded-2xl text-center space-y-1 ${
                    quizResult.passed ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}>
                    <div className="font-bold text-sm">
                      {quizResult.passed ? 'Passed! Score: ' : 'Needs Review. Score: '}{quizResult.scorePercent}%
                    </div>
                    <div className="text-xs">
                      {quizResult.passed ? 'Great job! Your progress has been updated.' : 'Review the explanations above and try again.'}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleQuizSubmit(currentQuiz)}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-colors"
                >
                  Submit Quiz for Automatic Grading
                </button>
              </div>
            )}

            {/* 3. Assignment Submission Tab */}
            {activeTab === 'assignment' && currentAssignment && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Course Capstone Project
                  </div>
                  <h3 className="text-lg font-bold text-white">{currentAssignment.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentAssignment.instructions}</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Solution (Markdown, GitHub Repository Link, or Architecture Notes):
                  </label>
                  <textarea
                    rows={5}
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    placeholder="Provide your project repo URL or summarize how you satisfied the requirements..."
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                  <button
                    onClick={() => setAssignmentSubmitted(true)}
                    className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    Submit Assignment for Review
                  </button>
                  {assignmentSubmitted && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Assignment submitted successfully! The teacher will review and grade your submission.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right: Curriculum Accordion Drawer */}
        {sidebarOpen && (
          <div className="w-80 sm:w-96 border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-white">Course Curriculum</span>
              <span className="text-[11px] text-slate-400">
                {enrollment?.progressPercent ?? 0}% completed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
              {course.sections.map((sec, sidx) => (
                <div key={sec.id} className="py-2">
                  <div className="px-4 py-2 font-bold text-xs text-slate-300">
                    {sidx + 1}. {sec.title}
                  </div>
                  <div className="space-y-0.5">
                    {sec.lessons.map((les) => {
                      const isCurrent = activeLesson?.id === les.id;
                      const isDone = !!enrollment?.lessonProgress[les.id]?.isCompleted;
                      return (
                        <button
                          key={les.id}
                          onClick={() => handleLessonSelect(les)}
                          className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-xs transition-colors ${
                            isCurrent
                              ? 'bg-brand-600/20 text-brand-300 font-semibold border-l-2 border-brand-500'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {Math.floor(les.durationSecs / 60)}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 3. GROUNDED AI TUTOR DRAWER */}
      <AITutorDrawer
        course={course}
        currentLessonTitle={activeLesson?.title}
        isOpen={showAITutor}
        onClose={() => setShowAITutor(false)}
        onSeekTo={(seconds) => {
          if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play();
            setIsPlaying(true);
          }
        }}
      />

    </div>
  );
}
