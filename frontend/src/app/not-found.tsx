import { Metadata } from "next";
import Link from "next/link";
import { Leaf, Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | FloraID",
  description:
    "The page you are looking for does not exist. Explore our flower identification gallery instead.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg mx-auto">
        {/* 404 Illustration */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-[#E8F5E9] dark:bg-[#2F382F]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-16 h-16 sm:w-20 sm:h-20 text-[#5B8C5A]/30 dark:text-[#7CB87C]/30" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[#E07A5F]/10 dark:bg-[#E07A5F]/20 flex items-center justify-center">
            <Search className="w-6 h-6 text-[#E07A5F]" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="font-display text-6xl sm:text-7xl font-bold text-[#5B8C5A]/20 dark:text-[#7CB87C]/20 leading-none">
          404
        </h1>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8] mt-4">
          Page Not Found
        </h2>

        <p className="text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] mt-3 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Suggestions */}
        <div className="mt-8 space-y-3">
          <p className="text-xs text-[#A3B0A4] uppercase tracking-wider font-medium">
            You might want to:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-primary w-full sm:w-auto justify-center"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/gallery"
              className="btn-secondary w-full sm:w-auto justify-center"
            >
              <Search className="w-4 h-4" />
              Browse Gallery
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
