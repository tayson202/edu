'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  UserPlus, 
  Briefcase,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { loadState, getCurrentUser } from '@/lib/storage';
import { Course } from '@/lib/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AcademyDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState([
    {
      id: 'inst-1',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@ai-innovate.io',
      role: 'Lead AI Instructor',
      assignedCourses: 2,
      students: 4520,
    },
    {
      id: 'inst-2',
      name: 'David Miller',
      email: 'david.miller@cloudarch.com',
      role: 'Principal Cloud DevOps Mentor',
      assignedCourses: 1,
      students: 1250,
    },
    {
      id: 'inst-3',
      name: 'Chloe Zhao',
      email: 'chloe.zhao@designlab.io',
      role: 'Staff Product Designer',
      assignedCourses: 1,
      students: 5600,
    },
  ]);

  const [newInstName, setNewInstName] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstRole, setNewInstRole] = useState('Senior Instructor');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const state = loadState();
    setCourses(state.courses);
  }, []);

  if (!mounted) return null;

  const handleAddInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInstName.trim() && newInstEmail.trim()) {
      setInstructors(prev => [
        ...prev,
        {
          id: `inst-${Date.now()}`,
          name: newInstName.trim(),
          email: newInstEmail.trim(),
          role: newInstRole,
          assignedCourses: 0,
          students: 0,
        },
      ]);
      setNewInstName('');
      setNewInstEmail('');
      setShowAddModal(false);
    }
  };

  const totalOrgStudents = instructors.reduce((acc, i) => acc + i.students, 0);

  return (
    <ProtectedRoute allowedRole="ACADEMY" dashboardTitle="Academy Portal">
      <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academy & Enterprise Organization Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Apex Learning Academy Portal
            </h1>
            <p className="text-xs text-slate-500">
              Manage multi-instructor rosters, syndicate curriculum, track cohort progression, and manage enterprise seat licenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Edit Institution Profile & Accreditation"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Academy Profile</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Instructor to Roster</span>
            </button>
          </div>
        </div>

        {/* 1. ACADEMY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Faculty / Instructors</div>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {instructors.length}
            </div>
            <div className="text-[11px] text-slate-500">Active verified teaching staff</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled Cohort Students</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalOrgStudents.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Across all academy programs</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academy Subscription Tier</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              Enterprise Pro
            </div>
            <div className="text-[11px] text-slate-500">Unlimited student seats & custom branding</div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academy Revenue Share</div>
            <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
              88% Net
            </div>
            <div className="text-[11px] text-slate-500">Preferential enterprise rate tier</div>
          </div>
        </div>

        {/* 2. INSTRUCTOR ROSTER TABLE */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Faculty & Instructor Roster</h2>
              <p className="text-xs text-slate-500">Assign course permissions and monitor instructor performance.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Active Courses</th>
                  <th className="py-3 px-4">Students Mentored</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {instructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        {inst.name.charAt(0)}
                      </div>
                      <span>{inst.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {inst.role}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {inst.email}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {inst.assignedCourses} courses
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {inst.students.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. SYNDICATED ACADEMY PROGRAMS */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Syndicated Programs & Bootcamps</h2>
              <p className="text-xs text-slate-500">Enterprise cohort programs published under Apex Academy.</p>
            </div>
            <Link href="/courses" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
              <span>View in Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Cohort Track 1</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Full-Stack Systems & Enterprise AI Engineering Program
              </h4>
              <p className="text-xs text-slate-500">
                12-week comprehensive bootcamp covering Next.js, PyTorch transformers, and distributed event systems.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Cohort Track 2</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Modern Design Systems with Figma & Tailwind Architecture
              </h4>
              <p className="text-xs text-slate-500">
                Comprehensive token architecture, design tokens, component libraries, and automated CI/CD handoff.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ADD INSTRUCTOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Faculty Instructor
            </h3>
            <p className="text-xs text-slate-500">
              Invite an instructor to author courses and mentor cohorts under the Apex Academy brand.
            </p>

            <form onSubmit={handleAddInstructor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newInstEmail}
                  onChange={(e) => setNewInstEmail(e.target.value)}
                  placeholder="e.g. robert.vance@apexacademy.edu"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Title
                </label>
                <input
                  type="text"
                  value={newInstRole}
                  onChange={(e) => setNewInstRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
      </div>
    </ProtectedRoute>
  );
}
