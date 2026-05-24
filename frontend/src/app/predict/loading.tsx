"use client";

import {
  SkeletonUploadZone,
  SkeletonResultCard,
} from "../../components/Skeleton";

export default function PredictLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="mb-8 space-y-3">
          <div className="animate-pulse h-4 w-32 bg-[#E8EDE8] dark:bg-[#2F382F] rounded" />
          <div className="animate-pulse h-10 w-64 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-lg mx-auto" />
          <div className="animate-pulse h-4 w-48 bg-[#E8EDE8] dark:bg-[#2F382F] rounded mx-auto" />
        </div>
        <SkeletonUploadZone />
        <div className="mt-8">
          <SkeletonResultCard />
        </div>
      </div>
    </div>
  );
}
