"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpRight } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { SkeletonCard } from "./Skeleton";

interface Species {
  id: string;
  latin: string;
  common: string;
  family: string;
  image: string;
}

interface SpeciesGalleryProps {
  species: Species[];
  isLoading?: boolean;
}

// Base64 blur placeholder (gray #E8EDE8)
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRThFREU4Ii8+PC9zdmc+";

export default function SpeciesGallery({
  species,
  isLoading = false,
}: SpeciesGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<string, boolean>
  >({});

  const searchInputRef = useRef<HTMLInputElement>(null);
  const familyScrollRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const families = [
    "all",
    ...Array.from(new Set(species.map((s) => s.family))),
  ];

  const filtered = species.filter((s) => {
    const matchesSearch =
      s.common.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.latin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFamily =
      selectedFamily === "all" || s.family === selectedFamily;
    return matchesSearch && matchesFamily;
  });

  // Announce filter changes to screen readers
  useEffect(() => {
    if (liveRegionRef.current && filtered.length > 0) {
      liveRegionRef.current.textContent = `${filtered.length} species found`;
    }
  }, [filtered.length]);

  const handleImageLoad = useCallback((id: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [id]: false }));
  }, []);

  const handleImageLoadStart = useCallback((id: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleFamilySelect = (family: string) => {
    setSelectedFamily(family);
    // Return focus to family scroll container for keyboard users
    if (familyScrollRef.current) {
      familyScrollRef.current.focus();
    }
  };

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B0A4]" />
            <div className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8EDE8] bg-white h-12" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Screen reader live region for results */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B0A4]"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search species... (Press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8EDE8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A] transition-all"
            aria-label="Search flower species by name or latin name"
            aria-describedby="search-hint"
          />
          <span id="search-hint" className="sr-only">
            Type to filter species by common name or latin name
          </span>
        </div>

        <div
          ref={familyScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide"
          role="group"
          aria-label="Filter by plant family"
          tabIndex={-1}
        >
          <Filter
            className="w-4 h-4 text-[#A3B0A4] shrink-0"
            aria-hidden="true"
          />
          {families.map((family) => (
            <button
              key={family}
              onClick={() => handleFamilySelect(family)}
              aria-pressed={selectedFamily === family}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
                selectedFamily === family
                  ? "bg-[#5B8C5A] text-white"
                  : "bg-white text-[#6B7B6C] hover:bg-[#E8F5E9]"
              }`}
            >
              {family === "all" ? "All Families" : family}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        aria-label="Flower species gallery"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              role="listitem"
            >
              <Link
                href={`/species/${item.id}`}
                className="card group overflow-hidden cursor-pointer block focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] focus:ring-offset-2 rounded-xl"
                aria-label={`${item.common}, ${item.latin}, family ${item.family}`}
              >
                <div className="relative aspect-square bg-[#FAFAF8]">
                  {imageLoadingStates[item.id] !== false && (
                    <div className="absolute inset-0 z-10">
                      <SkeletonCard />
                    </div>
                  )}
                  <Image
                    src={item.image}
                    alt={`${item.common} (${item.latin})`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    quality={80}
                    loading={index < 4 ? "eager" : "lazy"}
                    priority={index === 0}
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => handleImageLoad(item.id)}
                    onLoadStart={() => handleImageLoadStart(item.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <ArrowUpRight
                        className="w-4 h-4 text-[#2C3E2D]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-[#2C3E2D] group-hover:text-[#5B8C5A] transition-colors line-clamp-1">
                    {item.common}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7B6C] italic mt-0.5 line-clamp-1">
                    {item.latin}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-md bg-[#E8F5E9] text-xs font-medium text-[#5B8C5A]">
                    {item.family}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
            role="status"
            aria-live="polite"
          >
            <Search
              className="w-12 h-12 text-[#E8EDE8] mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-[#A3B0A4] text-sm sm:text-base">
              No species found matching &quot;{searchQuery}&quot;
              {selectedFamily !== "all" && ` in ${selectedFamily}`}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFamily("all");
              }}
              className="mt-4 text-sm text-[#5B8C5A] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] rounded px-2 py-1"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
