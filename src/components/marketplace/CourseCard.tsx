'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Clock, Users, ShieldCheck, Heart, Play } from 'lucide-react';
import { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  onPreviewClick?: (course: Course) => void;
}

export default function CourseCard({ course, onPreviewClick }: CourseCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    return `${minutes} mins`;
  };

  const isFree = course.isFree || course.priceCents === 0;
  const currentPrice = isFree ? 'Free' : `$${((course.discountPriceCents ?? course.priceCents) / 100).toFixed(2)}`;
  const originalPrice = !isFree && course.discountPriceCents ? `$${(course.priceCents / 100).toFixed(2)}` : null;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:shadow-xl transition-all duration-300">
      
      {/* Thumbnail & Video Preview Overlay */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {course.previewVideoUrl && (
            <button
              onClick={() => onPreviewClick ? onPreviewClick(course) : null}
              className="p-3 rounded-full bg-white/90 text-brand-600 shadow-lg hover:scale-110 transition-transform"
              title="Preview course video"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-sm">
            {course.categoryName}
          </span>
          <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full bg-slate-900/80 text-white backdrop-blur-md">
            {course.level.replace('_', ' ')}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white transition-all shadow-sm"
          title="Bookmark course"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{course.ratingAvg.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({course.ratingCount})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(course.totalDurationSecs)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.studentCount}
              </span>
            </div>
          </div>

          {/* Course Title & Subtitle */}
          <Link href={`/courses/${course.id}`} className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.subtitle || course.description}
          </p>
        </div>

        {/* Instructor Info & Price Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={course.teacher.avatarUrl}
              alt={course.teacher.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                {course.teacher.name}
              </span>
              {course.teacher.verificationStatus === 'VERIFIED' && (
                <span title="Verified Instructor" className="inline-flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1.5 justify-end">
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {originalPrice}
                </span>
              )}
              <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                {currentPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Action Link Button */}
        <Link
          href={`/courses/${course.id}`}
          className="w-full text-center py-2 px-3 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 group-hover:bg-brand-600 group-hover:text-white transition-all duration-200"
        >
          View Course & Curriculum
        </Link>
      </div>
    </div>
  );
}
