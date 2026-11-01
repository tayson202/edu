'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  loadState, 
  getCourseById, 
  updateLessonProgress, 
  getCurrentUser,
  enrollCourse 
} from '@/lib/storage';
import { Course, Lesson, CourseEnrollment } from '@/lib/types';

interface QnAThread {
  id: string;
  author: string;
  role: string;
  cohort: string;
  timeAgo: string;
  timestamp: string;
  upvotes: number;
  userUpvoted?: boolean;
  repliesCount: number;
  title: string;
  body?: string;
  instructorAnswer?: {
    author: string;
    role: string;
    timeAgo: string;
    text: string;
    code?: string;
    helpfulCount: number;
  };
  nestedReply?: {
    author: string;
    role: string;
    text: string;
  };
  statusBadge?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  groundedAt?: string;
  codeSnippet?: string;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseIdParam = params?.courseId as string;

  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Tabbed view under player
  const [activeTab, setActiveTab] = useState<'code' | 'sandbox' | 'qa' | 'resources'>('code');

  // Video player controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(255); // 04:15 in seconds
  const totalDurationSec = 1180; // 19:40
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.25x');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [zenFocus, setZenFocus] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto advance countdown
  const [autoAdvancePaused, setAutoAdvancePaused] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(925); // 15:25

  // Spark AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Why do we need a reducer function for the messages state property?'
    },
    {
      id: 'msg-2',
      sender: 'ai',
      text: 'In LangGraph, reducers dictate how new node outputs are merged into the shared graph state. Using (x, y) => x.concat(y) ensures sequential conversational turns append to history rather than overwriting previous context.',
      groundedAt: '04:15'
    }
  ]);
  const [tutorInputText, setTutorInputText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'Cyclic recursion & recursion_limit'
  ]);

  // Q&A Filter & State
  const [qaFilter, setQaFilter] = useState<'all' | 'instructor' | 'timestamp' | 'unresolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [modalQuestionTitle, setModalQuestionTitle] = useState(
    'How does StateGraph handle recursive cyclic edges in LangGraph?'
  );
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [attachSandboxCode, setAttachSandboxCode] = useState(true);

  // Toast resolution state
  const [showToast, setShowToast] = useState(true);

  // Initial threads
  const [qnaThreads, setQnaThreads] = useState<QnAThread[]>([
    {
      id: 't-1',
      author: 'Alex Rivera',
      role: 'Sr AI Engineer',
      cohort: 'Cohort 14',
      timeAgo: '2 hours ago',
      timestamp: '04:15',
      upvotes: 24,
      userUpvoted: false,
      repliesCount: 5,
      title: 'Why does StateGraph require Annotation.Root channels instead of a plain TypeScript interface?',
      instructorAnswer: {
        author: 'Dr. Elena Vance',
        role: 'Lead Instructor',
        timeAgo: '1 hour ago',
        text: 'A plain TypeScript interface only defines static shapes during compilation. Annotation.Root establishes runtime channel reducers that dictate how concurrency conflicts resolve and how historical state persists during graph pauses:',
        code: `const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  })
});`,
        helpfulCount: 19
      }
    },
    {
      id: 't-2',
      author: 'Marcus Chen',
      role: 'Staff Engineer',
      cohort: 'Cohort 12',
      timeAgo: '4 hours ago',
      timestamp: '03:42',
      upvotes: 15,
      userUpvoted: false,
      repliesCount: 2,
      title: 'Handling stream interrupts with human-in-the-loop nodes in Next.js edge runtime?',
      body: 'Is anyone experiencing issues serializing WebSocket snapshots when invoking Interrupt checkpoints inside Vercel Edge functions?',
      nestedReply: {
        author: 'Sarah Lin [TA]',
        role: 'Teaching Assistant',
        text: 'Edge runtime imposes socket timeouts; configure persistence on an external Redis/Postgres Checkpointer...'
      }
    },
    {
      id: 't-3',
      author: 'Priya Patel',
      role: 'ML Engineer',
      cohort: 'Cohort 14',
      timeAgo: '7 hours ago',
      timestamp: '01:18',
      upvotes: 8,
      userUpvoted: false,
      repliesCount: 1,
      title: 'How to configure retry policies on custom agent tools?',
      statusBadge: '1 Answer'
    }
  ]);

  // Load course data from storage
  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const user = getCurrentUser(state);
      
      // Match parameter or fallback to first course or course-ai-agents
      let targetCourse = getCourseById(state, courseIdParam);
      if (!targetCourse && state.courses.length > 0) {
        targetCourse = state.courses[0];
      }
      if (!targetCourse) return;
      setCourse(targetCourse);

      let enr = state.enrollments.find(e => e.userId === user.id && e.courseId === targetCourse.id);
      if (!enr) {
        const res = enrollCourse(targetCourse.id);
        enr = res.enrollment;
      }
      setEnrollment(enr || null);

      if (!activeLesson && targetCourse.sections[0]?.lessons[0]) {
        setActiveLesson(targetCourse.sections[0].lessons[0]);
      }
    };

    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, [courseIdParam]);

  // Timer countdown
  useEffect(() => {
    if (autoAdvancePaused) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [autoAdvancePaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const cycleSpeed = () => {
    const speeds = ['1x', '1.25x', '1.5x', '2x'];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(next.replace('x', ''));
    }
  };

  const handleCopyCode = () => {
    const code = `import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";

// 1. Define typed state graph annotations
const AgentState = Annotation.Root({
  messages: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  sender: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "user",
    default: () => "user",
  }),
});

// 2. Instantiate workflow node executors
const model = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022", temperature: 0 });
export const workflow = new StateGraph(AgentState);`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendTutor = (textToSend?: string) => {
    const query = (textToSend || tutorInputText).trim();
    if (!query) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setChatMessages(prev => [...prev, newMsg]);
    setTutorInputText('');

    setTimeout(() => {
      let aiReply = "Analyzing state checkpoint at 14:32. When an agent interrupts, the graph execution context stores the complete thread history within TypeScript memory without committing unverified mutations.";
      if (query.toLowerCase().includes('channel') || query.toLowerCase().includes('annotation')) {
        aiReply = "Annotation.Root channels establish typed state reducers. Each channel (like 'messages' or 'sender') defines how concurrent mutations merge into the graph snapshot.";
      } else if (query.toLowerCase().includes('reducer')) {
        aiReply = "Custom reducers like (x, y) => x.concat(y) ensure messages append sequentially across loop iterations rather than replacing the state.";
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          groundedAt: '04:15'
        }
      ]);
    }, 600);
  };

  const handleUpvote = (id: string) => {
    setQnaThreads(prev =>
      prev.map(t => {
        if (t.id === id) {
          const upvoted = !t.userUpvoted;
          return {
            ...t,
            userUpvoted: upvoted,
            upvotes: upvoted ? t.upvotes + 1 : t.upvotes - 1
          };
        }
        return t;
      })
    );
  };

  const handlePostQuestion = () => {
    if (!newQuestionInput.trim()) return;
    const newThread: QnAThread = {
      id: `t-${Date.now()}`,
      author: 'You (Student)',
      role: 'Software Engineer',
      cohort: 'Cohort 14',
      timeAgo: 'Just now',
      timestamp: '04:15',
      upvotes: 1,
      userUpvoted: true,
      repliesCount: 0,
      title: newQuestionInput.trim(),
      statusBadge: 'Spark AI Analyzing'
    };
    setQnaThreads(prev => [newThread, ...prev]);
    setNewQuestionInput('');
    setShowToast(true);
  };

  const handleModalSubmit = () => {
    if (!modalQuestionTitle.trim()) return;
    const newThread: QnAThread = {
      id: `t-${Date.now()}`,
      author: 'You (Student)',
      role: 'Software Engineer',
      cohort: 'Cohort 14',
      timeAgo: 'Just now',
      timestamp: attachTimestamp ? '04:15' : 'General',
      upvotes: 1,
      userUpvoted: true,
      repliesCount: 1,
      title: modalQuestionTitle.trim(),
      instructorAnswer: {
        author: 'Spark AI Instant Match',
        role: 'Verified 96% Match',
        timeAgo: 'Just now',
        text: 'In LangGraph, cyclic recursion is managed via graph traversal execution loops with a configurable recursion_limit (default: 25 steps). State channel reducers preserve history across loops without memory leaks.',
        code: `const app = workflow.compile({ checkpointer: new MemorySaver() });`,
        helpfulCount: 1
      }
    };
    setQnaThreads(prev => [newThread, ...prev]);
    setShowAskModal(false);
    setShowToast(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          <span className="font-headline-sm">Loading course workspace...</span>
        </div>
      </div>
    );
  }

  // Filtered threads
  const filteredThreads = qnaThreads.filter(t => {
    if (qaFilter === 'instructor') return !!t.instructorAnswer;
    if (qaFilter === 'timestamp') return t.timestamp === '04:15';
    if (qaFilter === 'unresolved') return t.repliesCount === 0;
    if (searchQuery) {
      return (
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* 1. TOP SUB-HEADER & BREADCRUMBS BAR */}
      <section className="border-b border-surface-container-high bg-surface-container-lowest/80 backdrop-blur-md sticky top-16 z-30 transition-all">
        <div className={`${zenFocus ? 'w-full px-6' : 'max-w-7xl mx-auto px-margin'} py-2 flex flex-wrap items-center justify-between gap-space-sm`}>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm overflow-hidden text-ellipsis whitespace-nowrap">
            <Link href="/courses" className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
              <span>Courses</span>
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              {course?.categoryName || 'AI & Software Engineering'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-title-md text-title-md font-semibold truncate max-w-xs md:max-w-md">
              {course?.title || 'Full-Stack AI Agents in TypeScript'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-outline hidden sm:inline">chevron_right</span>
            <span className="bg-surface-container-high px-space-xs py-0.5 rounded text-on-surface-variant font-label-sm text-label-sm hidden sm:inline">
              Sec 1.1: Architecture Primitives
            </span>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-semibold">Cloud VM Ready</span>
            </div>
            <button
              onClick={() => setZenFocus(!zenFocus)}
              className={`flex items-center gap-1 px-space-sm py-1 rounded font-label-md text-label-md transition-all ${
                zenFocus
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              id="toggle-focus-mode"
              title="Toggle distraction-free wide mode"
            >
              <span className="material-symbols-outlined text-[16px]">
                {zenFocus ? 'close_fullscreen' : 'fullscreen'}
              </span>
              <span>{zenFocus ? 'Exit Zen' : 'Zen Focus'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN 3-PANE SPLIT GRID */}
      <main className="w-full py-space-sm">
        <div className={`${zenFocus ? 'w-full px-6' : 'max-w-7xl mx-auto px-margin'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            
            {/* LEFT / CENTER LEARNING STAGE (~67% / 8 columns) */}
            <section className={`${zenFocus ? 'lg:col-span-8' : 'lg:col-span-8'} flex flex-col gap-space-md min-w-0`}>
              
              {/* CINEMA 16:9 VIDEO CANVAS */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-inverse-surface shadow-2xl group select-none border border-outline/20">
                {/* Backdrop Video Image / Stream */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC8AzZq1SbQ6t05UZkv65xpppwY3R9EmYYPXm_j2DV4uxvJWpl-k_aycY9_79F4mBXj5-4o4kHdHBM_fW8rURiRREUfFjV7sIBZmXr3FQ2fO9iZWD7YtJfNgY1MVSSJqUTnDp8RBDvTFdg_YHs1u5gWY6-EHbYAiMOFqRWFcl0XcLcqQ5_z8tdo3tWWJeL0by99BPCocf09WMJAjtwzajSd8dvU3ZfHH4I3kTS7FG8')`
                  }}
                />

                {/* Optional HTML5 Video element if streaming */}
                <video
                  ref={videoRef}
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  className={`absolute inset-0 w-full h-full object-cover ${isPlaying ? 'opacity-90' : 'opacity-0'} pointer-events-none transition-opacity`}
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTimeSec(Math.floor(videoRef.current.currentTime));
                    }
                  }}
                />

                {/* Translucent Film Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-transparent to-inverse-surface/40 pointer-events-none" />

                {/* Center Play/Pause Button Overlay */}
                <button
                  onClick={handleTogglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary/90 text-on-primary flex items-center justify-center shadow-xl backdrop-blur-md transform transition-all duration-300 group-hover:scale-110 active:scale-95 hover:bg-primary z-20"
                  id="main-play-btn"
                  aria-label="Play or pause video"
                >
                  <span className="material-symbols-outlined text-[36px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Top-Left Lesson Tag Inset */}
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs z-10">
                  <div className="px-space-sm py-1 rounded bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm tracking-wider uppercase border border-outline/30">
                    LESSON 1.1 • LANGGRAPH & LCEL ARCHITECTURE
                  </div>
                  <div className="px-space-sm py-1 rounded bg-primary-container/90 backdrop-blur-md text-on-primary font-label-sm text-label-sm font-semibold">
                    Core Primitives
                  </div>
                </div>

                {/* Bottom Video Controls Ribbon */}
                <div className="absolute bottom-0 left-0 right-0 p-space-md bg-gradient-to-t from-inverse-surface via-inverse-surface/90 to-transparent flex flex-col gap-space-xs z-10">
                  {/* Timeline Scrubber with Timestamp Bookmarks */}
                  <div
                    className="relative w-full h-3 flex items-center cursor-pointer group/scrub"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      const newTime = Math.floor(ratio * totalDurationSec);
                      setCurrentTimeSec(newTime);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                    }}
                  >
                    {/* Background Bar */}
                    <div className="w-full h-1.5 bg-outline/40 rounded-full overflow-hidden">
                      {/* Buffered Progress */}
                      <div className="h-full bg-surface-container-high/40 w-3/4"></div>
                    </div>

                    {/* Active Played Fill */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-primary-container rounded-full"
                      style={{ width: `${(currentTimeSec / totalDurationSec) * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-on-primary shadow-md transition-transform scale-0 group-hover/scrub:scale-100"
                      style={{ left: `calc(${((currentTimeSec / totalDurationSec) * 100).toFixed(1)}% - 7px)` }}
                    />

                    {/* Code Snippet Bookmark Indicators */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-secondary-fixed rounded shadow"
                      style={{ left: '18%' }}
                      title="Bookmark: Graph State Declaration (05:12)"
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-tertiary-fixed rounded shadow"
                      style={{ left: '50.6%' }}
                      title="Bookmark: Interrupt Checkpoint Invocation (14:32)"
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-primary-fixed rounded shadow"
                      style={{ left: '82%' }}
                      title="Bookmark: Resuming from Saved Snapshot (23:40)"
                    />
                  </div>

                  {/* Controls Horizontal Row */}
                  <div className="flex items-center justify-between text-inverse-on-surface font-label-md text-label-md pt-1">
                    <div className="flex items-center gap-space-md">
                      <button
                        onClick={handleTogglePlay}
                        className="hover:text-primary-fixed transition-colors flex items-center"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          const t = Math.max(0, currentTimeSec - 10);
                          setCurrentTimeSec(t);
                          if (videoRef.current) videoRef.current.currentTime = t;
                        }}
                        className="hover:text-primary-fixed transition-colors flex items-center"
                        title="Replay 10s"
                      >
                        <span className="material-symbols-outlined text-[20px]">replay_10</span>
                      </button>
                      <button
                        onClick={() => {
                          const t = Math.min(totalDurationSec, currentTimeSec + 10);
                          setCurrentTimeSec(t);
                          if (videoRef.current) videoRef.current.currentTime = t;
                        }}
                        className="hover:text-primary-fixed transition-colors flex items-center"
                        title="Forward 10s"
                      >
                        <span className="material-symbols-outlined text-[20px]">forward_10</span>
                      </button>

                      {/* Volume Slider */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="hover:text-primary-fixed transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isMuted ? 'volume_off' : volume > 50 ? 'volume_up' : 'volume_down'}
                          </span>
                        </button>
                        <div
                          className="w-14 h-1.5 bg-outline/40 rounded-full overflow-hidden cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const val = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                            setVolume(val);
                            if (val > 0) setIsMuted(false);
                          }}
                        >
                          <div
                            className="h-full bg-surface-container-lowest"
                            style={{ width: isMuted ? '0%' : `${volume}%` }}
                          />
                        </div>
                      </div>

                      {/* Time display */}
                      <div className="font-body-sm text-body-sm text-surface-container-high tracking-tight">
                        <span className="text-inverse-on-surface font-bold">{formatTime(currentTimeSec)}</span> / {formatTime(totalDurationSec)}
                      </div>
                    </div>

                    {/* Right Control Toggles */}
                    <div className="flex items-center gap-space-md">
                      <button
                        onClick={cycleSpeed}
                        className="px-space-xs py-0.5 rounded hover:bg-surface-container-high/20 font-label-sm text-label-sm text-secondary-fixed transition-colors font-mono"
                        title="Cycle playback speed"
                      >
                        {playbackSpeed}
                      </button>
                      <div className="flex items-center gap-1 px-space-xs py-0.5 rounded hover:bg-surface-container-high/20 text-inverse-on-surface transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[16px]">hd</span>
                        <span className="font-label-sm text-label-sm">1080p</span>
                      </div>
                      <button
                        onClick={() => {
                          if (videoRef.current && document.pictureInPictureEnabled) {
                            if (document.pictureInPictureElement) {
                              document.exitPictureInPicture();
                            } else {
                              videoRef.current.requestPictureInPicture();
                            }
                          }
                        }}
                        className="hover:text-primary-fixed transition-colors flex items-center"
                        title="Picture-in-Picture"
                      >
                        <span className="material-symbols-outlined text-[20px]">picture_in_picture_alt</span>
                      </button>
                      <button
                        onClick={() => setZenFocus(!zenFocus)}
                        className="hover:text-primary-fixed transition-colors flex items-center"
                        title="Toggle Fullscreen"
                      >
                        <span className="material-symbols-outlined text-[22px]">fullscreen</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUB-PLAYER TABBED INTERACTIVE MODULE PANEL */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-space-md flex flex-col gap-space-md">
                
                {/* Navigation Tabs */}
                <div className="flex items-center gap-space-xs overflow-x-auto pb-1 bg-surface-container-low p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`tab-btn px-space-md py-1.5 rounded font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                      activeTab === 'code'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                    <span>Lesson Code & Interrupts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className={`tab-btn px-space-md py-1.5 rounded font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                      activeTab === 'sandbox'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    <span>Runnable Sandbox</span>
                    <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                      LIVE
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`tab-btn px-space-md py-1.5 rounded font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                      activeTab === 'qa'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                    <span>Q&A ({qnaThreads.length + 35})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`tab-btn px-space-md py-1.5 rounded font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                      activeTab === 'resources'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">folder_zip</span>
                    <span>Assets & Repo</span>
                  </button>
                </div>

                {/* TAB 1: CODE & INTERRUPTS */}
                {activeTab === 'code' && (
                  <div className="flex flex-col gap-space-sm animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Lesson 1.1: Core LLM Orchestration & Graph Primitives
                        </span>
                        <span className="px-space-xs py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                          LangGraph v0.2.14
                        </span>
                        <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          TypeScript 5.4
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 px-space-sm py-1.5 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedCode ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy TypeScript'}</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('sandbox')}
                          className="flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                          <span>Run in Cloud Sandbox</span>
                        </button>
                      </div>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Overview of foundational DAG execution loops, Node/Edge states, and streaming tokens from LLM gateways. Learn how StateGraph orchestrates message state flow and deterministic graph transitions.
                    </p>

                    {/* Syntax Highlighted Code Box */}
                    <div className="relative bg-inverse-surface text-inverse-on-surface rounded-xl p-space-md font-mono text-[13px] leading-relaxed overflow-x-auto shadow-md border border-outline/30">
                      <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-inverse-surface text-outline font-label-sm text-label-sm border-b border-outline/20">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-error inline-block"></span>
                          <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim inline-block"></span>
                          <span className="w-3 h-3 rounded-full bg-secondary-fixed inline-block"></span>
                          <span className="ml-2 text-inverse-on-surface font-sans">
                            orchestration-primitives.ts • Node & State Definition
                          </span>
                        </div>
                        <span className="text-secondary-fixed flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> Node Verified
                        </span>
                      </div>
                      <pre className="overflow-x-auto">
                        <code>
                          <span className="text-tertiary-fixed-dim">import</span> &#123; StateGraph, END, Annotation &#125; <span className="text-tertiary-fixed-dim">from</span> <span className="text-secondary-fixed">&quot;@langchain/langgraph&quot;</span>;{'\n'}
                          <span className="text-tertiary-fixed-dim">import</span> &#123; ChatAnthropic &#125; <span className="text-tertiary-fixed-dim">from</span> <span className="text-secondary-fixed">&quot;@langchain/anthropic&quot;</span>;{'\n\n'}
                          <span className="text-outline">&#47;&#47; 1. Define typed state graph annotations</span>{'\n'}
                          <span className="text-tertiary-fixed-dim">const</span> AgentState = Annotation.Root(&#123;{'\n'}
                          {'  '}messages: Annotation&lt;string[]&gt;(&#123;{'\n'}
                          {'    '}reducer: (x, y) =&gt; x.concat(y),{'\n'}
                          {'    '}default: () =&gt; [],{'\n'}
                          {'  '}&#125;),{'\n'}
                          {'  '}sender: Annotation&lt;string&gt;(&#123;{'\n'}
                          {'    '}reducer: (x, y) =&gt; y ?? x ?? <span className="text-secondary-fixed">&quot;user&quot;</span>,{'\n'}
                          {'    '}default: () =&gt; <span className="text-secondary-fixed">&quot;user&quot;</span>,{'\n'}
                          {'  '}&#125;),{'\n'}
                          &#125;);{'\n\n'}
                          <span className="text-outline">&#47;&#47; 2. Instantiate workflow node executors</span>{'\n'}
                          <span className="text-tertiary-fixed-dim">const</span> model = <span className="text-primary-fixed-dim">new</span> <span className="text-surface-variant">ChatAnthropic</span>(&#123; model: <span className="text-secondary-fixed">&quot;claude-3-5-sonnet-20241022&quot;</span>, temperature: 0 &#125;);{'\n'}
                          <span className="text-tertiary-fixed-dim">export const</span> workflow = <span className="text-primary-fixed-dim">new</span> <span className="text-surface-variant">StateGraph</span>(AgentState);
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* TAB 2: RUNNABLE SANDBOX */}
                {activeTab === 'sandbox' && (
                  <div className="flex flex-col gap-space-sm animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-2 border-b border-surface-container-high">
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <div className="flex items-center gap-1.5 px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                          <span className="font-semibold">Pod #us-east-4 (Online • 0.4 vCPU / 1.2 GB RAM)</span>
                        </div>
                        <div className="flex items-center gap-1 px-space-xs py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[15px] text-tertiary">memory</span>
                          <span>Node.js v20.11 / LangGraph Engine</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <button
                          onClick={() => alert('Restarting sandbox container pod...')}
                          className="flex items-center gap-1 px-space-sm py-1 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                          title="Restart VM Pod"
                        >
                          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                          <span>Restart</span>
                        </button>
                        <button
                          onClick={() => alert('TTY term active')}
                          className="flex items-center gap-1 px-space-sm py-1 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">terminal</span>
                          <span>Toggle Term</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
                      {/* Left: StateGraph DAG Monitor */}
                      <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-space-xs border border-surface-container-high">
                        <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
                          <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[17px] text-primary">account_tree</span>
                            StateGraph DAG Monitor
                          </span>
                          <span className="px-space-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                            Active Session
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 py-space-xs">
                          {/* Node 1 */}
                          <div className="p-space-sm rounded-lg bg-surface-container-lowest border border-surface-container-high shadow-sm flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-outline uppercase font-mono tracking-wider font-semibold">
                                Node 1 • Input Gateway
                              </span>
                              <span className="text-[11px] font-mono text-secondary flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> COMPLETED (42ms)
                              </span>
                            </div>
                            <div className="text-body-sm text-body-sm font-mono text-on-surface bg-surface-container-low p-1.5 rounded text-xs">
                              <span className="text-outline">State:</span> &#123; messages: [&quot;What is LangGraph?&quot;], sender: &quot;user&quot; &#125;
                            </div>
                          </div>

                          <div className="flex justify-center text-outline">
                            <span className="material-symbols-outlined text-[18px] text-primary">arrow_downward</span>
                          </div>

                          {/* Node 2 */}
                          <div className="p-space-sm rounded-lg bg-surface-container-lowest border border-primary text-on-surface shadow-sm flex flex-col gap-1 ring-1 ring-primary/20">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-primary uppercase font-mono tracking-wider font-bold">
                                Node 2 • agent_node (LLM)
                              </span>
                              <span className="text-[11px] font-mono text-primary flex items-center gap-1 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> RUNNING (210ms)
                              </span>
                            </div>
                            <div className="text-body-sm text-body-sm font-mono text-on-surface bg-surface-container-low p-1.5 rounded text-xs">
                              <span className="text-outline">Invoking:</span> claude-3-5-sonnet • stream: true
                            </div>
                          </div>

                          <div className="flex justify-center text-outline">
                            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                          </div>

                          {/* Node 3 */}
                          <div className="p-space-sm rounded-lg bg-surface-container-lowest border border-surface-container-high opacity-70 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-outline uppercase font-mono tracking-wider">
                                Node 3 • tools_condition → END
                              </span>
                              <span className="text-[11px] font-mono text-outline font-semibold">QUEUED</span>
                            </div>
                            <div className="text-body-sm text-body-sm font-mono text-outline-variant bg-surface-container-low p-1.5 rounded text-xs">
                              Awaiting agent token completion...
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Live Terminal Stream */}
                      <div className="lg:col-span-7 bg-inverse-surface text-inverse-on-surface rounded-xl p-space-md font-mono text-[13px] leading-relaxed flex flex-col justify-between shadow-md border border-outline/30">
                        <div className="flex items-center justify-between pb-space-xs mb-space-xs border-b border-outline/30 font-label-sm text-label-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-error inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-secondary-fixed inline-block"></span>
                            <span className="ml-2 text-inverse-on-surface font-sans">
                              bash • /workspace/langgraph-orchestrator
                            </span>
                          </div>
                          <span className="text-secondary-fixed flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">terminal</span> tty1: 115200bps
                          </span>
                        </div>
                        <div className="overflow-x-auto flex flex-col gap-1.5 py-1 text-[12px]">
                          <p className="text-outline">⚡ Connected to dedicated sandbox pod [pod-edf-89241-langgraph] via WebSockets</p>
                          <p className="text-secondary-fixed font-bold">$ tsc --noEmit &amp;&amp; node dist/orchestration-primitives.js</p>
                          <p className="text-on-tertiary-container">[TypeScript Engine] Compilation finished with 0 errors (144ms)</p>
                          <p className="text-primary-fixed-dim">[StateGraph] Initializing GraphInstance with AgentState reducer schema...</p>
                          <p className="text-secondary-fixed">[StateGraph] Entry: agent_node -&gt; tools_condition -&gt; END</p>
                          <p className="text-inverse-on-surface">&gt; Streaming chunk: &quot;LangGraph is a library for building stateful, multi-actor applications with LLMs...&quot;</p>
                          <div className="bg-inverse-surface/80 p-2 rounded border border-outline/30 mt-1 text-[11px]">
                            <span className="text-outline">Output Payload:</span>{' '}
                            <span className="text-secondary-fixed">&#123; &quot;status&quot;: &quot;INTERRUPT_WAIT&quot;, &quot;latency_ms&quot;: 312, &quot;tokens_used&quot;: 48 &#125;</span>
                          </div>
                          <div className="flex items-center gap-1 text-secondary-fixed mt-1 font-bold">
                            <span>runner@eduflow-sandbox:~/workspace$</span>
                            <span className="w-2 h-4 bg-secondary-fixed animate-pulse inline-block"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Q&A DISCUSSION */}
                {activeTab === 'qa' && (
                  <div className="flex flex-col gap-space-md animate-fadeIn">
                    
                    {/* Spark AI Instant Match Banner */}
                    <div className="p-space-sm rounded-xl bg-secondary-container/20 border border-secondary/30 flex items-center justify-between gap-space-sm shadow-sm">
                      <div className="flex items-center gap-space-xs">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-on-secondary flex-shrink-0">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <span className="font-label-md text-label-md text-on-surface">
                          <strong className="text-secondary font-bold">1 Question resolved via Spark AI Instant Match</strong> • Saved ~2 hours instructor reply queue
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
                        Synced at 04:15
                      </span>
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs border-b border-surface-container-high">
                      <div className="flex-1 min-w-[240px] relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 38 questions in Lesson 1.1..."
                          className="w-full h-9 pl-9 pr-space-md rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-surface-container-high"
                        />
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <div className="flex items-center gap-1 px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md">
                          <span className="text-outline text-label-sm">Sort:</span>
                          <span className="font-semibold">Most Upvoted</span>
                          <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
                        </div>
                        <button
                          onClick={() => setShowAskModal(true)}
                          className="flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span>Ask Question</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setQaFilter('all')}
                        className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm shadow-sm transition-colors ${
                          qaFilter === 'all'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        All ({qnaThreads.length + 35})
                      </button>
                      <button
                        onClick={() => setQaFilter('instructor')}
                        className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                          qaFilter === 'instructor'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                        Instructor Answered (14)
                      </button>
                      <button
                        onClick={() => setQaFilter('timestamp')}
                        className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                          qaFilter === 'timestamp'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                        Timestamped at 04:15 (6)
                      </button>
                      <button
                        onClick={() => setQaFilter('unresolved')}
                        className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                          qaFilter === 'unresolved'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        Unresolved (4)
                      </button>
                    </div>

                    {/* Question Thread List */}
                    <div className="flex flex-col gap-space-md">
                      {filteredThreads.map(thread => (
                        <div
                          key={thread.id}
                          className="rounded-xl bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 p-space-md shadow-sm flex flex-col gap-space-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-space-sm">
                            <div className="flex items-start gap-space-sm">
                              {/* Upvote Button */}
                              <button
                                onClick={() => handleUpvote(thread.id)}
                                className={`flex flex-col items-center justify-center w-10 py-1.5 rounded-lg transition-colors ${
                                  thread.userUpvoted
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                                <span className="font-label-md font-bold text-[13px]">{thread.upvotes}</span>
                              </button>

                              <div>
                                <div className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm mb-1">
                                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[11px]">
                                    {thread.author.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-on-surface">{thread.author}</span>
                                  <span className="text-outline">• {thread.role}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[11px]">
                                    {thread.cohort}
                                  </span>
                                  <span className="text-outline">• {thread.timeAgo}</span>
                                  <span className="flex items-center gap-0.5 px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px]">
                                    <span className="material-symbols-outlined text-[12px]">schedule</span> {thread.timestamp}
                                  </span>
                                </div>
                                <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                                  {thread.title}
                                </h4>
                                {thread.body && (
                                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                    {thread.body}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                              <span>{thread.repliesCount} replies</span>
                            </div>
                          </div>

                          {/* Instructor Endorsed Answer */}
                          {thread.instructorAnswer && (
                            <div className="ml-10 rounded-lg bg-surface-container-low p-space-sm border-l-4 border-secondary flex flex-col gap-space-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-space-xs">
                                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
                                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                                  </div>
                                  <span className="font-label-md text-label-md font-bold text-on-surface">
                                    {thread.instructorAnswer.author}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px]">verified</span> {thread.instructorAnswer.role}
                                  </span>
                                </div>
                                <span className="font-label-sm text-label-sm text-outline">{thread.instructorAnswer.timeAgo}</span>
                              </div>
                              <p className="font-body-sm text-body-sm text-on-surface">
                                {thread.instructorAnswer.text}
                              </p>
                              {thread.instructorAnswer.code && (
                                <pre className="bg-inverse-surface text-inverse-on-surface p-2.5 rounded-lg text-[12px] font-mono overflow-x-auto shadow-inner">
                                  <code>{thread.instructorAnswer.code}</code>
                                </pre>
                              )}
                              <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-on-surface-variant">
                                <div className="flex items-center gap-2">
                                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                                    <span>{thread.instructorAnswer.helpfulCount} helpful</span>
                                  </button>
                                  <button className="hover:text-primary transition-colors">Reply</button>
                                </div>
                                <span className="text-secondary font-semibold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Endorsed Answer
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Nested TA reply */}
                          {thread.nestedReply && (
                            <div className="ml-10 flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low px-space-sm py-1.5 rounded-lg">
                              <span className="material-symbols-outlined text-[16px] text-tertiary">reply</span>
                              <span>
                                <strong className="text-on-surface font-semibold">{thread.nestedReply.author}:</strong> {thread.nestedReply.text}
                              </span>
                            </div>
                          )}

                          {thread.statusBadge && (
                            <div className="self-end">
                              <span className="px-space-xs py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                                {thread.statusBadge}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Inline Question Input Bar */}
                    <div className="rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-space-xs border border-surface-container-high">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={newQuestionInput}
                          onChange={(e) => setNewQuestionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePostQuestion();
                          }}
                          placeholder="Ask a question about this timestamp (04:15) or lesson topic..."
                          className="w-full h-10 pl-3 pr-24 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none shadow-sm"
                        />
                        <div className="absolute right-1.5 flex items-center gap-1">
                          <button
                            className="w-7 h-7 rounded flex items-center justify-center text-outline hover:text-on-surface"
                            title="Format code"
                          >
                            <span className="material-symbols-outlined text-[16px]">code</span>
                          </button>
                          <button
                            onClick={handlePostQuestion}
                            className="px-space-sm py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container font-semibold transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ASSETS & REPOSITORY */}
                {activeTab === 'resources' && (
                  <div className="flex flex-col gap-space-sm animate-fadeIn">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Curriculum Downloads & Repositories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                      <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
                          <div>
                            <div className="font-label-md font-semibold text-on-surface">LangGraph_Primitives_Architecture.pdf</div>
                            <div className="text-[11px] text-outline">PDF • 3.4 MB • Updated Today</div>
                          </div>
                        </div>
                        <button className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold">
                          Download
                        </button>
                      </div>

                      <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-2xl">folder_zip</span>
                          <div>
                            <div className="font-label-md font-semibold text-on-surface">fullstack-ai-agents-starter.zip</div>
                            <div className="text-[11px] text-outline">ZIP • 12.8 MB • TypeScript 5.4</div>
                          </div>
                        </div>
                        <button className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* RIGHT SIDEBAR (~33% / 4 columns) */}
            <aside className="lg:col-span-4 flex flex-col gap-space-md min-w-0">
              
              {/* SECTION 1: Course Roadmap & Progress */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">account_tree</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Course Roadmap</h2>
                  </div>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                    12% Done
                  </span>
                </div>

                {/* Overall Progress Indicator */}
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden my-1">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '12%' }} />
                </div>

                {/* Modules Accordion */}
                <div className="flex flex-col gap-space-xs mt-1">
                  {/* Module 1: In Progress */}
                  <div className="rounded-lg bg-surface-container-high/40 p-space-sm flex flex-col gap-space-xs border border-primary/20">
                    <div className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">radio_button_checked</span>
                        <span className="font-title-md text-title-md text-primary font-bold">1. Core LLM Orchestration</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-semibold">1/4 In Progress</span>
                    </div>

                    <div className="flex flex-col gap-1 pl-space-md pt-space-xs">
                      {/* 1.1 Active */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-primary-container text-on-primary font-title-md text-title-md shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] animate-pulse">play_circle</span>
                          <span className="font-semibold text-xs sm:text-sm">1.1 Core Primitives & StateGraph</span>
                        </div>
                        <span className="font-label-sm text-label-sm bg-primary px-1.5 py-0.5 rounded font-mono">19:40</span>
                      </div>

                      {/* 1.2 */}
                      <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container text-on-surface-variant font-body-sm text-body-sm cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[16px]">circle</span>
                          <span className="text-xs sm:text-sm">1.2 State Annotation & Reducers</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-outline font-mono">16:45</span>
                      </div>

                      {/* 1.3 */}
                      <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container text-on-surface-variant font-body-sm text-body-sm cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[16px]">circle</span>
                          <span className="text-xs sm:text-sm">1.3 Dynamic Tool Calling Nodes</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-outline font-mono">24:10</span>
                      </div>

                      {/* 1.4 */}
                      <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container text-on-surface-variant font-body-sm text-body-sm cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[16px]">circle</span>
                          <span className="text-xs sm:text-sm">1.4 Streaming Token Yields</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-outline font-mono">21:15</span>
                      </div>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="rounded-lg bg-surface-container-low p-space-sm">
                    <div className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-outline text-[20px]">circle</span>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">2. Agent Routing & State Graphs</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">5 Lessons</span>
                    </div>
                  </div>

                  {/* Module 3 (Locked) */}
                  <div className="rounded-lg bg-surface-container-low p-space-sm opacity-60">
                    <div className="flex items-center justify-between cursor-not-allowed">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                        <span className="font-title-md text-title-md text-outline font-semibold">3. Production Streaming & Toolkits</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline">6 Lessons</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Spark AI Tutor — Grounded Assistant */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-space-md flex flex-col gap-space-sm flex-1">
                
                {/* Tutor Header with Sync Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">neurology</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight font-semibold">Spark AI Tutor</h3>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Grounded to Video & AST
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-mono font-semibold">
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    <span>04:15 synced</span>
                  </div>
                </div>

                {/* Suggested Contextual Prompt Chips */}
                <div className="flex flex-wrap gap-1.5 my-1">
                  <button
                    onClick={() => handleSendTutor('Explain Annotation.Root channels')}
                    className="prompt-chip px-space-xs py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-all text-left truncate max-w-full"
                  >
                    "Explain Annotation.Root channels"
                  </button>
                  <button
                    onClick={() => handleSendTutor('Why use custom reducers?')}
                    className="prompt-chip px-space-xs py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-all text-left truncate max-w-full"
                  >
                    "Why use custom reducers?"
                  </button>
                  <button
                    onClick={() => handleSendTutor('How does message concatenation work?')}
                    className="prompt-chip px-space-xs py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-all text-left"
                  >
                    "How does message concatenation work?"
                  </button>
                </div>

                {/* Conversation Stream */}
                <div className="flex flex-col gap-space-sm max-h-[300px] overflow-y-auto pr-1" id="tutor-chat-stream">
                  {chatMessages.map(msg => (
                    <React.Fragment key={msg.id}>
                      {msg.sender === 'user' ? (
                        <div className="flex items-start gap-2 justify-end">
                          <div className="bg-primary text-on-primary p-space-sm rounded-xl rounded-tr-none font-body-sm text-body-sm max-w-[85%] shadow-sm">
                            {msg.text}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary mt-1">
                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          </div>
                          <div className="bg-surface-container-low p-space-sm rounded-xl rounded-tl-none font-body-sm text-body-sm text-on-surface flex flex-col gap-space-xs max-w-[90%] border border-surface-container-high/60">
                            <p>{msg.text}</p>
                            <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-on-surface-variant">
                              <span className="text-secondary flex items-center gap-0.5 font-semibold">
                                <span className="material-symbols-outlined text-[13px]">verified</span> Grounded at {msg.groundedAt || '04:15'}
                              </span>
                              <button
                                onClick={() => {
                                  setSavedNotes(prev => [...prev, 'State Reducer Concatenation']);
                                  alert('Note saved to your personal study notebook!');
                                }}
                                className="hover:text-primary flex items-center gap-0.5 transition-colors font-semibold"
                              >
                                <span className="material-symbols-outlined text-[13px]">bookmark_add</span>
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Bookmark Saved Note Indicator Card */}
                <div className="p-2 rounded-lg bg-secondary-container/20 border border-secondary/30 flex items-center justify-between text-xs text-on-surface">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px] text-secondary">bookmark</span>
                    <span className="truncate font-semibold">Saved: Cyclic recursion & recursion_limit</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                    04:15
                  </span>
                </div>

                {/* Interactive Tutor Input Bar */}
                <div className="mt-auto pt-space-xs">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={tutorInputText}
                      onChange={(e) => setTutorInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendTutor();
                      }}
                      placeholder="Ask Spark about this line or timestamp..."
                      className="w-full h-10 pl-3 pr-20 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm border border-surface-container-high"
                    />
                    <div className="absolute right-1 flex items-center gap-1">
                      <button
                        onClick={() => setTutorInputText(prev => prev + ' (attached: Lesson 1.1 AST)')}
                        className="w-7 h-7 rounded flex items-center justify-center text-outline hover:text-on-surface"
                        title="Attach Code Selection"
                      >
                        <span className="material-symbols-outlined text-[16px]">attach_file</span>
                      </button>
                      <button
                        onClick={() => handleSendTutor()}
                        className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container shadow-sm transition-transform active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </aside>

          </div>

          {/* 3. PERSISTENT BOTTOM CONTROL & NEXT ACTIONS BAR */}
          <div className="w-full mt-space-lg bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-space-md flex flex-wrap items-center justify-between gap-space-md">
            {/* Previous Navigation Button */}
            <Link
              href={`/courses/${course?.id || 'course-ai-agents'}`}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Course Overview & Setup</span>
            </Link>

            {/* Center Auto-Advance Countdown Feedback */}
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className={`w-2.5 h-2.5 rounded-full bg-secondary ${autoAdvancePaused ? '' : 'animate-ping'}`} />
                <span>Auto-advances to 1.2 in</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold font-mono">
                  {formatTime(countdownSeconds)}
                </span>
              </div>
              <button
                onClick={() => setAutoAdvancePaused(!autoAdvancePaused)}
                className="text-outline hover:text-on-surface text-[12px] font-label-sm underline ml-1 cursor-pointer"
              >
                {autoAdvancePaused ? 'Resume Auto-play' : 'Pause Auto-play'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => setActiveTab('qa')}
                className="flex items-center gap-1 px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span>Ask Cohort</span>
              </button>

              <button
                onClick={() => {
                  alert('Advancing to Lesson 1.2: State Annotation & Reducers');
                  setCurrentTimeSec(0);
                }}
                className="flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-md transition-all transform active:scale-95 font-semibold"
              >
                <span>Next: 1.2 State Annotation & Reducers</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* 4. MODAL: ASK A QUESTION IN LESSON 1.1 */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container-high my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-space-md border-b border-surface-container-high bg-surface-container-low">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-space-xs">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">help</span>
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Ask a Question in Lesson 1.1
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Core Primitives & StateGraph • Synced to current video playback
                </p>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-md flex flex-col gap-space-md max-h-[75vh] overflow-y-auto">
              {/* Instant Match Alert */}
              <div className="p-space-sm rounded-lg bg-primary/10 border border-primary/30 flex items-start gap-space-sm shadow-sm">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md font-bold text-primary">
                        Spark AI Instant Match Found
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold text-[10px] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">verified</span> 96% Confidence
                      </span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm text-[10px]">
                      Grounded Solution
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Scanned Lesson 1.1 transcript, AST graph syntax, and LangGraph v0.2 documentation. A direct answer to your question is ready below.
                  </p>
                </div>
              </div>

              {/* Title input */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                  <span>Question Title</span>
                  <span className="font-body-sm text-body-sm text-outline text-[12px]">Be specific (min. 15 chars)</span>
                </label>
                <input
                  type="text"
                  value={modalQuestionTitle}
                  onChange={(e) => setModalQuestionTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-colors"
                />
              </div>

              {/* Attachments row */}
              <div className="flex flex-wrap items-center gap-space-sm">
                <div
                  onClick={() => setAttachTimestamp(!attachTimestamp)}
                  className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg border font-label-md text-label-md cursor-pointer select-none transition-colors ${
                    attachTimestamp
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface-container-low border-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: attachTimestamp ? "'FILL' 1" : "'FILL' 0" }}>
                    check_circle
                  </span>
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span className="font-semibold">Attach playback timestamp: 04:15</span>
                </div>

                <div
                  onClick={() => setAttachSandboxCode(!attachSandboxCode)}
                  className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg border font-label-md text-label-md cursor-pointer select-none transition-colors ${
                    attachSandboxCode
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface-container-low border-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: attachSandboxCode ? "'FILL' 1" : "'FILL' 0" }}>
                    check_circle
                  </span>
                  <span className="material-symbols-outlined text-[15px]">code</span>
                  <span>Attach Sandbox Code Snippet</span>
                </div>
              </div>

              {/* Spark AI Instant Answer Card */}
              <div className="rounded-xl bg-gradient-to-tr from-surface-container-low via-surface-container-lowest to-surface-container-high/40 border-2 border-primary/40 p-space-md shadow-md flex flex-col gap-space-sm ring-1 ring-primary/20">
                <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                      <span className="material-symbols-outlined text-[17px]">bolt</span>
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-1.5">
                        <span>Spark AI Instant Answer</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-normal">
                          Grounded to 04:15 & Repo AST
                        </span>
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Pre-Check Match</span>
                  </div>
                </div>

                <div className="font-body-sm text-body-sm text-on-surface flex flex-col gap-space-xs">
                  <p>
                    In LangGraph, cyclic recursion is managed via graph traversal execution loops with a configurable{' '}
                    <code className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-[11px] font-semibold text-primary">
                      recursion_limit
                    </code>{' '}
                    (default: 25 steps). State channel reducers (such as{' '}
                    <code className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-[11px]">BaseMessage[]</code>{' '}
                    concatenation) preserve history across loops without memory leaks, while checkpoint savers (
                    <code className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-[11px]">MemorySaver</code> / Redis) track each cycle transition state snapshot.
                  </p>
                  <div className="rounded-lg bg-inverse-surface text-inverse-on-surface p-space-sm font-mono text-[12px] flex flex-col gap-1 shadow-inner overflow-x-auto">
                    <div className="flex items-center justify-between text-[11px] text-outline pb-1 border-b border-outline/30 font-sans">
                      <span>workflow-runner.ts</span>
                      <span className="text-secondary-fixed">LangGraph TypeScript v0.2.14</span>
                    </div>
                    <pre className="leading-relaxed text-[12px] overflow-x-auto">
                      <code><span className="text-secondary-fixed">const</span> app = workflow.compile(&#123; checkpointer: <span className="text-primary-fixed">new</span> MemorySaver() &#125;);</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-space-sm pt-2">
                <button
                  onClick={() => setShowAskModal(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  className="px-space-lg py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-md transition-all font-semibold"
                >
                  Accept &amp; Post to Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING RESOLUTION TOAST */}
      {showToast && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-start gap-space-sm bg-surface-container-lowest border border-secondary/30 shadow-2xl rounded-xl p-space-md max-w-md ring-1 ring-secondary/20 duration-300 animate-slideUp"
          id="resolution-toast"
        >
          <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Question Resolved with Spark AI!
                </h4>
                <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold text-[10px]">
                  +10 Study XP
                </span>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-outline hover:text-on-surface transition-colors"
                aria-label="Dismiss toast"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
              The instant answer has been saved to your Lesson 1.1 Study Notes and bookmarked at timestamp 04:15.
            </p>
            <div className="flex items-center gap-space-sm pt-1">
              <button
                onClick={() => {
                  alert('Opening Lesson 1.1 Study Notes repository...');
                }}
                className="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-0.5 transition-colors"
              >
                <span>View in Notes</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
              <button
                onClick={() => setShowToast(false)}
                className="text-outline hover:text-on-surface font-label-sm text-label-sm transition-colors"
              >
                Undo
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 6. PLATFORM FOOTER */}
      <footer className="w-full bg-surface-container-low mt-space-xl py-space-lg border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>© 2026 ULearn Platform. Engineered by</span>
            <a
              href="https://tayson202.github.io/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-on-surface hover:text-primary underline decoration-primary/40 underline-offset-2 transition-colors"
            >
              Youssef Tamer
            </a>
            <span className="text-outline">|</span>
            <a
              href="https://wa.me/201203598649"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-semibold"
            >
              WhatsApp
            </a>
            <span className="text-outline">|</span>
            <a
              href="https://instagram.com/yousseftamer951?xtok=MThsOWU4ZnpoYnBtNQ%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tertiary-fixed hover:underline font-semibold"
            >
              Instagram
            </a>
          </div>
          <div className="flex items-center gap-space-md font-label-md text-label-md">
            <a className="hover:text-on-surface transition-colors" href="https://tayson202.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Portfolio</a>
            <a className="hover:text-on-surface transition-colors" href="https://www.linkedin.com/in/youssef-tamer-169827248" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="hover:text-on-surface transition-colors" href="https://github.com/tayson202" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
