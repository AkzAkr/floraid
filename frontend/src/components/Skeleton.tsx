"use client";

import { motion } from "framer-motion";

// ─── Skeleton Base ───────────────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#E8EDE8] dark:bg-[#2F382F] ${className}`}
    />
  );
}

// ─── Skeleton Card (untuk Gallery, Koleksi, Featured) ──────────────
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Collection Card (untuk Koleksi) ────────────────────
export function SkeletonCollectionCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 sm:p-5 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12 rounded-md shrink-0 ml-2" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Featured Card (untuk Homepage horizontal scroll) ───
export function SkeletonFeaturedCard() {
  return (
    <div className="snap-start shrink-0 w-64 sm:w-72">
      <div className="card overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <div className="p-4 sm:p-5 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Text Lines ─────────────────────────────────────────
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

// ─── Skeleton Upload Zone ────────────────────────────────────────
export function SkeletonUploadZone() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="upload-zone p-10 sm:p-14 lg:p-16 text-center">
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
          <div className="space-y-2 w-full max-w-xs mx-auto">
            <Skeleton className="h-6 w-full mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Result Card ────────────────────────────────────────
export function SkeletonResultCard() {
  return (
    <div className="card overflow-hidden max-w-2xl mx-auto">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-16 rounded-lg shrink-0 ml-3" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Gallery Grid ───────────────────────────────────────
export function SkeletonGalleryGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Skeleton Collection Grid ────────────────────────────────────
export function SkeletonCollectionGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <SkeletonCollectionCard />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Skeleton Stats ──────────────────────────────────────────────
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 overflow-x-auto pb-2 sm:pb-0 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
