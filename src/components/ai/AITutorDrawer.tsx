'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, BookOpen, Clock, Bot, User as UserIcon, HelpCircle } from 'lucide-react';
import { Course } from '@/lib/types';
import { askAITutor, AITutorResponse } from '@/lib/ai-service';

interface AITutorDrawerProps {
  course: Course;
  currentLessonTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSeekTo?: (seconds: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  citations?: AITutorResponse['sourceCitations'];
  suggestedQuestions?: string[];
  timestamp: string;
}

export default function AITutorDrawer({
  course,
  currentLessonTitle,
  isOpen,
  onClose,
  onSeekTo
}: AITutorDrawerProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: `Hello! I am your AI Personal Tutor for **"${course.title}"**. 

I am grounded directly in the authorized curriculum and transcripts. Ask me anything about this course, architectural concepts, code patterns, or dynamic commission ledgers!`,
      suggestedQuestions: [
        'How does dynamic marketplace commission work?',
        'Explain Server Components vs Client Components in this course',
        'Summarize the core takeaways of this lesson',
      ],
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: textToSend.trim(),
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await askAITutor(textToSend, course, currentLessonTitle);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: resp.answer,
        citations: resp.sourceCitations,
        suggestedQuestions: resp.suggestedNextQuestions,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'AI',
          text: 'I encountered a temporary connection issue. Please try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-all">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
              <span>AI Personal Tutor</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                Grounded
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
              {currentLessonTitle || course.title}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'AI' && (
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              m.sender === 'USER'
                ? 'bg-brand-600 text-white rounded-br-none'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Citations Box */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-brand-500" />
                    Verified Lesson Citations
                  </div>
                  {m.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 text-[11px] space-y-0.5"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <span>{cite.lessonTitle}</span>
                        {cite.timestampSecs !== undefined && onSeekTo && (
                          <button
                            onClick={() => onSeekTo(cite.timestampSecs!)}
                            className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 text-[10px]"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            {Math.floor(cite.timestampSecs / 60)}:{(cite.timestampSecs % 60).toString().padStart(2, '0')}
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{cite.relevance}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Question Suggestions */}
              {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                  {m.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-brand-200 dark:border-brand-900/50 text-[10px] font-medium transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'USER' && (
              <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 italic py-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>Analyzing lesson context & verifying citations...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this course..."
            className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-center text-slate-400 mt-2">
          Responses grounded in official course transcripts. Includes source citations.
        </div>
      </div>
    </div>
  );
}
