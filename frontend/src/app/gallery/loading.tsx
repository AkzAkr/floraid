"use client";

import { SkeletonGalleryGrid } from "../../components/Skeleton";

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="mb-8 space-y-3">
          <div className="animate-pulse h-10 w-64 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-lg" />
          <div className="animate-pulse h-4 w-48 bg-[#E8EDE8] dark:bg-[#2F382F] rounded" />
        </div>
        <div className="mb-8 flex gap-3">
          <div className="animate-pulse flex-1 h-12 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-xl" />
          <div className="animate-pulse h-12 w-24 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-xl" />
        </div>
        <SkeletonGalleryGrid count={8} />
      </div>
    </div>
  );
}
