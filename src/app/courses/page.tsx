'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { loadState } from '@/lib/storage';
import { Course, Category } from '@/lib/types';
import CourseCard from '@/components/marketplace/CourseCard';

export default function CoursesCatalogPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price-asc' | 'price-desc'>('popular');

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

  const filteredAndSortedCourses = useMemo(() => {
    let list = [...courses];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.teacher.name.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCat !== 'all') {
      const foundCat = categories.find(c => c.slug === selectedCat || c.id === selectedCat);
      if (foundCat) {
        list = list.filter(c => c.categoryId === foundCat.id);
      }
    }

    // Level filter
    if (selectedLevel !== 'all') {
      list = list.filter(c => c.level === selectedLevel);
    }

    // Price filter
    if (priceFilter === 'free') {
      list = list.filter(c => c.isFree || c.priceCents === 0);
    } else if (priceFilter === 'paid') {
      list = list.filter(c => !c.isFree && c.priceCents > 0);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'popular') return (b.studentCount || 0) - (a.studentCount || 0);
      if (sortBy === 'rating') return b.ratingAvg - a.ratingAvg;
      if (sortBy === 'price-asc') return (a.discountPriceCents ?? a.priceCents) - (b.discountPriceCents ?? b.priceCents);
      if (sortBy === 'price-desc') return (b.discountPriceCents ?? b.priceCents) - (a.discountPriceCents ?? a.priceCents);
      return 0;
    });

    return list;
  }, [courses, categories, search, selectedCat, selectedLevel, priceFilter, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setSelectedLevel('all');
    setPriceFilter('all');
    setSortBy('popular');
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 py-10 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Knowledge</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Explore Course Marketplace
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Filter through verified programs taught by industry practitioners and accredited institutions.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-4">
          
          {/* Top Row: Search & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by course title, teacher name, topic, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="popular">Sort: Most Popular</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Category, Level, Price, Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Category selector */}
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Level selector */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Difficulty Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>

              {/* Price buttons */}
              <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${priceFilter === 'all' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  All Prices
                </button>
                <button
                  onClick={() => setPriceFilter('paid')}
                  className={`px-3 py-1 rounded-lg transition-colors ${priceFilter === 'paid' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setPriceFilter('free')}
                  className={`px-3 py-1 rounded-lg transition-colors ${priceFilter === 'free' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  Free
                </button>
              </div>

            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing {filteredAndSortedCourses.length} of {courses.length} courses
              </span>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredAndSortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              No matching courses found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We couldn't find any courses matching your specific query and filters. Try clearing your search or switching categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
