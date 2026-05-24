"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ArrowRight, MapPin, Sprout } from "lucide-react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import EmptyState from "../../components/EmptyState";
import ErrorFallback from "../../components/ErrorFallback";
import { SkeletonCollectionGrid } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import {
  type CollectionItem,
  readCollection,
  removeFromCollection,
} from "../../lib/collection";
import { useLanguage, type Language } from "../../lib/i18n";

function CollectionLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-3">
          <div className="animate-pulse h-10 w-48 bg-[#E8EDE8] dark:bg-[#2F382F] rounded-lg" />
          <div className="animate-pulse h-4 w-32 bg-[#E8EDE8] dark:bg-[#2F382F] rounded" />
        </div>
        <div className="animate-pulse w-12 h-12 rounded-2xl bg-[#E8EDE8] dark:bg-[#2F382F]" />
      </div>
      <SkeletonCollectionGrid count={6} />
    </div>
  );
}

function formatSavedDate(date: string, language: Language, recently: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return recently;

  return parsed.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CollectionContent() {
  const { showSuccess, showError } = useToast();
  const { language, t } = useLanguage();
  const [saved, setSaved] = useState<CollectionItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadCollection = () => {
    try {
      setSaved(readCollection());
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();

    const syncCollection = () => loadCollection();
    window.addEventListener("floraid-collection-change", syncCollection);
    window.addEventListener("storage", syncCollection);
    return () => {
      window.removeEventListener("floraid-collection-change", syncCollection);
      window.removeEventListener("storage", syncCollection);
    };
  }, []);

  const removeSaved = (id: string) => {
    setRemovingId(id);

    try {
      const nextItems = removeFromCollection(id);
      setSaved(nextItems);
      showSuccess(t("collection.removed"), "delete");
    } catch {
      showError(t("collection.removeFailed"));
    } finally {
      setTimeout(() => setRemovingId(null), 180);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    loadCollection();
  };

  if (hasError) {
    return (
      <ErrorFallback
        variant="api"
        error={t("collection.loadFailed")}
        onRetry={handleRetry}
      />
    );
  }

  if (isLoading) {
    return <CollectionLoading />;
  }

  return (
    <>
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
                {t("collection.title")}
              </h1>
              <p className="mt-2 text-[#6B7B6C] dark:text-[#A3B0A4] text-sm sm:text-base">
                {saved.length} {t("collection.savedSuffix")}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] dark:bg-[#2F382F] flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-[#5B8C5A] fill-current" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {saved.length === 0 ? (
            <EmptyState
              variant="collection"
              title={t("collection.emptyTitle")}
              description={t("collection.emptyDescription")}
              actionLabel={t("collection.browseGallery")}
              actionHref="/gallery"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence>
                {saved.map((flower, i) => (
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: removingId === flower.id ? 0 : 1,
                      y: removingId === flower.id ? -20 : 0,
                      scale: removingId === flower.id ? 0.96 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    layout
                  >
                    <article className="card overflow-hidden group h-full">
                      <div className="relative aspect-[4/3] bg-[#E8F5E9] dark:bg-[#2F382F] overflow-hidden">
                        <Image
                          src={flower.imageUrl}
                          alt={`${flower.commonName} flower`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 dark:bg-[#242B24]/90 text-[11px] font-medium text-[#5B8C5A] dark:text-[#7CB87C]">
                          {flower.colorHint}
                        </span>

                        <button
                          onClick={() => removeSaved(flower.id)}
                          disabled={removingId === flower.id}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-[#242B24]/90 text-[#E07A5F] opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-[#E07A5F] hover:text-white disabled:opacity-50"
                          aria-label={`Remove ${flower.commonName} from collection`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-[#2C3E2D] dark:text-[#E8EDE8] line-clamp-1">
                            {flower.commonName}
                          </h3>
                          <p className="text-sm text-[#6B7B6C] dark:text-[#A3B0A4] italic line-clamp-1">
                            {flower.scientificName}
                          </p>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7B6C] dark:text-[#A3B0A4]">
                            <Sprout className="w-3 h-3 text-[#5B8C5A]" />
                            <span className="line-clamp-1">{flower.family}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7B6C] dark:text-[#A3B0A4]">
                            <MapPin className="w-3 h-3 text-[#5B8C5A]" />
                            <span className="line-clamp-1">{flower.origin}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-xs text-[#A3B0A4]">
                            {t("collection.saved")}{" "}
                            {formatSavedDate(
                              flower.savedAt,
                              language,
                              t("collection.recently"),
                            )}
                          </span>
                          <Link
                            href={`/species/${flower.id}`}
                            className="text-sm text-[#5B8C5A] hover:text-[#3D6B3D] transition-colors flex items-center gap-1 shrink-0"
                          >
                            {t("collection.details")}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function KoleksiPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] transition-colors duration-300">
      <Navbar />
      <CollectionContent />
    </main>
  );
}
