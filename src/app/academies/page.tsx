'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  MapPin, 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';
import { loadState, getAcademies, getCurrentUser, isUserAuthenticated, getTeacherMemberships } from '@/lib/storage';
import { User, AcademyMembership } from '@/lib/types';

export default function AcademiesPage() {
  const [mounted, setMounted] = useState(false);
  const [academies, setAcademies] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [memberships, setMemberships] = useState<AcademyMembership[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const state = loadState();
      const acads = getAcademies(state);
      setAcademies(acads);
      const u = getCurrentUser(state);
      setCurrentUser(u);
      setAuthenticated(isUserAuthenticated(state));
      if (u) {
        setMemberships(getTeacherMemberships(u.id, state));
      }
    };
    sync();
    window.addEventListener('ulearn_state_changed', sync);
    return () => window.removeEventListener('ulearn_state_changed', sync);
  }, []);

  if (!mounted) return null;

  const allDepartments = Array.from(
    new Set(academies.flatMap(a => a.academyProfile?.departments || []))
  );

  const filteredAcademies = academies.filter(academy => {
    const prof = academy.academyProfile;
    if (!prof) return false;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || 
      prof.academyName.toLowerCase().includes(q) ||
      prof.headline.toLowerCase().includes(q) ||
      prof.campusLocation.toLowerCase().includes(q) ||
      prof.accreditation.toLowerCase().includes(q) ||
      (prof.departments || []).some(d => d.toLowerCase().includes(q));

    const matchesDept = selectedDept === 'ALL' || (prof.departments || []).includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  const isTeacher = currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'SELLER' || currentUser.role === 'COACH');

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 1. HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Directory & Teaching Partnerships</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Discover Leading <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">Academies</span> & Join Faculty Rosters
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore accredited academies, discover open teaching appointments, and partner with established educational institutions. Work independently or syndicate your curriculum under enterprise academy standards.
            </p>

            {isTeacher && (
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <Link
                  href="/teacher/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span>Go to Teacher Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="text-xs text-purple-200/90 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Logged in as Verified Instructor: <strong>{currentUser?.name}</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-40 top-10 w-60 h-60 bg-blue-600/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* 2. SEARCH & DEPARTMENT FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by academy name, accreditation, or location..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedDept === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              All Disciplines
            </button>
            {allDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* 3. ACADEMY CARDS GRID */}
        {filteredAcademies.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Academies Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No institutions matched your current search filters. Try adjusting keywords or clear the filter.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedDept('ALL'); }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredAcademies.map((academy) => {
              const prof = academy.academyProfile!;
              
              // Check user membership status with this academy
              const existingMembership = memberships.find(
                m => (m.academyId === prof.id || m.academyUserId === academy.id)
              );

              const opportunitiesCount = prof.openOpportunities?.length || 0;

              return (
                <div
                  key={academy.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Cover Image */}
                  <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                    <img
                      src={prof.coverImageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80'}
                      alt={prof.academyName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

                    {/* Accreditation Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{prof.accreditation}</span>
                    </div>

                    {/* Open Positions Tag */}
                    {opportunitiesCount > 0 && (
                      <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                        <Briefcase className="w-3 h-3" />
                        <span>{opportunitiesCount} Open Faculty Roles</span>
                      </div>
                    )}

                    {/* Logo & Headline */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                      <img
                        src={academy.avatarUrl}
                        alt={prof.academyName}
                        className="w-14 h-14 rounded-2xl border-2 border-white dark:border-slate-800 object-cover shadow-md bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <h2 className="text-lg font-black text-white truncate flex items-center gap-1.5">
                          <span>{prof.academyName}</span>
                          <span title="Verified Institution">
                            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          </span>
                        </h2>
                        <p className="text-xs text-slate-300 truncate">
                          {prof.headline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {prof.bio}
                    </p>

                    {/* Department Badges */}
                    {prof.departments && prof.departments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {prof.departments.map((dept) => (
                          <span
                            key={dept}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-center">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {(prof.totalStudents || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">Students</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {prof.facultyCount || 12}
                        </div>
                        <div className="text-[10px] text-slate-500">Faculty Staff</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Est. {prof.establishedYear}
                        </div>
                        <div className="text-[10px] text-slate-500">Founded</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{prof.campusLocation}</span>
                      </div>
                      
                      {/* Membership Status Indicator */}
                      {existingMembership && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          existingMembership.status === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : existingMembership.status === 'PENDING'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : existingMembership.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{existingMembership.status}</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-3">
                      <Link
                        href={`/academies/${academy.id}`}
                        className="flex-1 py-2.5 px-4 rounded-xl text-center text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>View Academy Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      {prof.websiteUrl && (
                        <a
                          href={prof.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 transition-colors"
                          title="Official Academy Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
