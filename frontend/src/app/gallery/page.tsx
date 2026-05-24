"use client";

import { useState, useRef, Suspense, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  motion,
  useInView,
  type Variants,
  AnimatePresence,
} from "framer-motion";
import {
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Palette,
  Sprout,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import EmptyState from "../../components/EmptyState";
import ErrorFallback from "../../components/ErrorFallback";
import { SkeletonGalleryGrid } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import { useDebounce } from "../../hooks/useDebounce";
import { getSpeciesList, type SpeciesListItem } from "../../lib/api";
import {
  isInCollection,
  removeFromCollection,
  saveToCollection,
} from "../../lib/collection";
import { useLanguage } from "../../lib/i18n";

const ITEMS_PER_PAGE = 12;

const COLOR_STYLES: Record<string, { bg: string; fg: string; ring: string }> = {
  Pink: { bg: "bg-rose-100", fg: "text-rose-700", ring: "bg-rose-300" },
  Yellow: { bg: "bg-yellow-100", fg: "text-yellow-700", ring: "bg-yellow-300" },
  Orange: { bg: "bg-orange-100", fg: "text-orange-700", ring: "bg-orange-300" },
  Red: { bg: "bg-red-100", fg: "text-red-700", ring: "bg-red-300" },
  Purple: { bg: "bg-violet-100", fg: "text-violet-700", ring: "bg-violet-300" },
  Blue: { bg: "bg-sky-100", fg: "text-sky-700", ring: "bg-sky-300" },
  White: { bg: "bg-stone-100", fg: "text-stone-700", ring: "bg-stone-300" },
  Dark: { bg: "bg-zinc-200", fg: "text-zinc-800", ring: "bg-zinc-500" },
  Mixed: { bg: "bg-[#E8F5E9]", fg: "text-[#5B8C5A]", ring: "bg-[#D4A574]" },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.45 },
  }),
};

function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-8 space-y-3">
        <div className="animate-pulse h-10 w-64 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-lg" />
        <div className="animate-pulse h-4 w-48 bg-[#E8EDE8] dark:bg-[#2F382F] rounded" />
      </div>
      <div className="mb-8 flex gap-3">
        <div className="animate-pulse flex-1 h-12 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-xl" />
        <div className="animate-pulse h-12 w-24 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-xl" />
      </div>
      <SkeletonGalleryGrid count={10} />
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1),
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[#E8EDE8] dark:border-[#2F382F] text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {showPages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            currentPage === page
              ? "bg-[#5B8C5A] text-white"
              : "border border-[#E8EDE8] dark:border-[#2F382F] text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A]"
          }`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[#E8EDE8] dark:border-[#2F382F] text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function getDisplayId(classId: string) {
  return classId.replace("class_", "");
}

function SpeciesCard({
  species,
  index,
  isInView,
  saved,
  onToggleSave,
}: {
  species: SpeciesListItem;
  index: number;
  isInView: boolean;
  saved: boolean;
  onToggleSave: (species: SpeciesListItem, saved: boolean) => void;
}) {
  const { t } = useLanguage();
  const colorHint = species.color_hint || "Mixed";
  const colorStyle = COLOR_STYLES[colorHint] || COLOR_STYLES.Mixed;
  const displayName = species.common_name || species.display_name;
  const scientificName = species.scientific_name || species.class_name;
  const family = species.family || "Unknown family";
  const origin = species.native_region || "Origin unknown";
  const imageUrl = species.image_url || `/species/${species.class_id}.jpg`;

  return (
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      custom={index}
    >
      <Link href={`/species/${species.class_id}`} className="block h-full">
        <article className="card overflow-hidden group h-full">
          <div className={`relative aspect-[4/3] ${colorStyle.bg} dark:bg-[#2F382F] overflow-hidden`}>
            <Image
              src={imageUrl}
              alt={`${displayName} flower`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-[#5B8C5A]" />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 dark:bg-[#242B24]/90 text-[11px] font-medium text-[#5B8C5A] dark:text-[#7CB87C]">
              #{getDisplayId(species.class_id)}
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-[#242B24]/90 flex items-center justify-center shadow-sm">
                <ArrowUpRight className="w-4 h-4 text-[#2C3E2D] dark:text-[#E8EDE8]" />
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleSave(species, saved);
              }}
              aria-pressed={saved}
              aria-label={saved ? "Remove from collection" : "Save to collection"}
              className={`absolute bottom-3 right-3 p-2 rounded-full shadow-sm transition-all ${
                saved
                  ? "bg-[#5B8C5A] text-white"
                  : "bg-white/90 dark:bg-[#242B24]/90 text-[#5B8C5A] hover:bg-[#5B8C5A] hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="p-3 sm:p-4">
            <h3 className="font-display text-sm sm:text-base font-semibold text-[#2C3E2D] dark:text-[#E8EDE8] group-hover:text-[#5B8C5A] dark:group-hover:text-[#7CB87C] transition-colors line-clamp-1">
              {displayName}
            </h3>
            <p className="text-xs text-[#6B7B6C] dark:text-[#A3B0A4] italic mt-0.5 line-clamp-1">
              {scientificName}
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-[#6B7B6C] dark:text-[#A3B0A4]">
                <Sprout className="w-3 h-3 text-[#5B8C5A]" />
                <span className="line-clamp-1">{family}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6B7B6C] dark:text-[#A3B0A4]">
                <MapPin className="w-3 h-3 text-[#5B8C5A]" />
                <span className="line-clamp-1">{origin}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8F5E9] dark:bg-[#2F382F] text-[10px] font-medium text-[#5B8C5A] dark:text-[#7CB87C]">
                <Palette className="w-3 h-3" />
                {colorHint}
              </span>
              <span className="text-[10px] text-[#A3B0A4]">
                {species.fun_facts_count || 0} {t("gallery.facts")}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function GalleryContent() {
  const { showSuccess } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const initialFamily = searchParams.get("family") || "All";
  const initialColor = searchParams.get("color") || "All";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [species, setSpecies] = useState<SpeciesListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedFamily, setSelectedFamily] = useState(initialFamily);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 300);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const families = [
    "All",
    ...Array.from(
      new Set(species.map((s) => s.family).filter(Boolean) as string[]),
    ).sort(),
  ];
  const colors = [
    "All",
    ...Array.from(
      new Set(species.map((s) => s.color_hint || "Mixed").filter(Boolean)),
    ).sort(),
  ];

  const loadSpecies = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const result = await getSpeciesList({ limit: 200 });
      setSpecies(result.species);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecies();
  }, [loadSpecies]);

  useEffect(() => {
    const syncSaved = () => {
      setSavedIds(new Set(species.map((item) => item.class_id).filter(isInCollection)));
    };

    syncSaved();
    window.addEventListener("floraid-collection-change", syncSaved);
    window.addEventListener("storage", syncSaved);
    return () => {
      window.removeEventListener("floraid-collection-change", syncSaved);
      window.removeEventListener("storage", syncSaved);
    };
  }, [species]);

  const updateURL = useCallback(
    (q: string, family: string, color: string, page: number) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (family !== "All") params.set("family", family);
      if (color !== "All") params.set("color", color);
      if (page > 1) params.set("page", page.toString());

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  useEffect(() => {
    updateURL(debouncedSearch, selectedFamily, selectedColor, currentPage);
  }, [debouncedSearch, selectedFamily, selectedColor, currentPage, updateURL]);

  const filtered = species.filter((item) => {
    const haystack = [
      item.class_id,
      item.class_name,
      item.display_name,
      item.common_name,
      item.scientific_name,
      item.family,
      item.native_region,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(debouncedSearch.toLowerCase());
    const matchesFamily =
      selectedFamily === "All" || item.family === selectedFamily;
    const matchesColor =
      selectedColor === "All" || (item.color_hint || "Mixed") === selectedColor;

    return matchesSearch && matchesFamily && matchesColor;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRetry = () => {
    loadSpecies();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFamily("All");
    setSelectedColor("All");
    setCurrentPage(1);
    showSuccess(t("gallery.filtersCleared"));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFamilyChange = (family: string) => {
    setSelectedFamily(family);
    setCurrentPage(1);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleSave = (item: SpeciesListItem, saved: boolean) => {
    if (saved) {
      removeFromCollection(item.class_id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.class_id);
        return next;
      });
      showSuccess(t("gallery.removed"), "delete");
      return;
    }

    saveToCollection(item);
    setSavedIds((prev) => new Set(prev).add(item.class_id));
    showSuccess(`${item.common_name || item.display_name} ${t("gallery.savedSuffix")}`, "heart");
  };

  if (hasError) {
    return (
      <ErrorFallback
        variant="api"
        error="Failed to load species data. Make sure the backend is running."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <>
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
              {t("gallery.title")}
            </h1>
            <p className="mt-2 text-[#6B7B6C] dark:text-[#A3B0A4] text-sm sm:text-base">
              {t("gallery.descriptionPrefix")} {species.length || 102}{" "}
              {t("gallery.descriptionSuffix")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 sm:mt-8 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B0A4]" />
                <input
                  type="text"
                  placeholder={t("gallery.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-[#E8EDE8] dark:border-[#2F382F] bg-white dark:bg-[#242B24] text-sm text-[#2C3E2D] dark:text-[#E8EDE8] focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A] transition-all placeholder:text-[#A3B0A4]"
                />
                <AnimatePresence>
                  {searchQuery !== debouncedSearch && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <div className="w-4 h-4 border-2 border-[#5B8C5A]/30 border-t-[#5B8C5A] rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  showFilters ||
                  selectedFamily !== "All" ||
                  selectedColor !== "All"
                    ? "border-[#5B8C5A] text-[#5B8C5A] bg-[#E8F5E9] dark:bg-[#2F382F]"
                    : "border-[#E8EDE8] dark:border-[#2F382F] bg-white dark:bg-[#242B24] text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A]"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("gallery.filters")}
                {(selectedFamily !== "All" || selectedColor !== "All") && (
                  <span className="w-2 h-2 rounded-full bg-[#5B8C5A]" />
                )}
              </button>
            </div>

            <motion.div
              initial={false}
              animate={{
                height: showFilters ? "auto" : 0,
                opacity: showFilters ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white dark:bg-[#242B24] border border-[#E8EDE8] dark:border-[#2F382F] space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#A3B0A4] uppercase mb-2 block">
                    {t("gallery.family")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {families.map((family) => (
                      <button
                        key={family}
                        onClick={() => handleFamilyChange(family)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedFamily === family
                            ? "bg-[#5B8C5A] text-white"
                            : "bg-[#E8F5E9] dark:bg-[#2F382F] text-[#6B7B6C] dark:text-[#A3B0A4] hover:bg-[#5B8C5A]/10"
                        }`}
                      >
                        {family}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#A3B0A4] uppercase mb-2 block">
                    {t("gallery.colorHint")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedColor === color
                            ? "bg-[#5B8C5A] text-white"
                            : "bg-[#E8F5E9] dark:bg-[#2F382F] text-[#6B7B6C] dark:text-[#A3B0A4] hover:bg-[#5B8C5A]/10"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {(searchQuery ||
                  selectedFamily !== "All" ||
                  selectedColor !== "All") && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-[#5B8C5A] hover:text-[#3D6B3D] transition-colors font-medium"
                  >
                    {t("gallery.clearAll")}
                  </button>
                )}
              </div>
            </motion.div>

            <div className="flex items-center justify-between gap-3 text-xs text-[#A3B0A4]">
              <span>
                {t("gallery.showing")} {filtered.length} {t("gallery.of")}{" "}
                {species.length} {t("gallery.species")}
              </span>
              {(selectedFamily !== "All" || selectedColor !== "All") && (
                <button
                  onClick={handleClearFilters}
                  className="text-[#5B8C5A] hover:underline"
                >
                  {t("gallery.resetFilters")}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={ref} className="pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <SkeletonGalleryGrid count={ITEMS_PER_PAGE} />
          ) : paginated.length === 0 ? (
            <EmptyState
              variant="gallery"
              title={t("gallery.noSpecies")}
              description={
                debouncedSearch
                  ? `${t("gallery.noResultsPrefix")} "${debouncedSearch}" ${t("gallery.noResultsSuffix")}`
                  : t("gallery.noFilterMatch")
              }
              actionLabel={t("gallery.clearFilters")}
              onAction={handleClearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {paginated.map((item, i) => (
                  <SpeciesCard
                    key={item.class_id}
                    species={item}
                    index={i}
                    isInView={isInView}
                    saved={savedIds.has(item.class_id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] transition-colors duration-300">
      <Navbar />
      <Suspense fallback={<GalleryLoading />}>
        <GalleryContent />
      </Suspense>
    </main>
  );
}
