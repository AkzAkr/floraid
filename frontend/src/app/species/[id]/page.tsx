"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  Heart,
  Share2,
  MapPin,
  Palette,
  Sparkles,
  Sprout,
  ExternalLink,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Breadcrumb from "../../../components/Breadcrumb";
import EmptyState from "../../../components/EmptyState";
import { SkeletonText, Skeleton } from "../../../components/Skeleton";
import { useToast } from "../../../components/Toast";
import { getSpeciesDetails } from "../../../lib/api";
import {
  isInCollection,
  removeFromCollection,
  saveToCollection,
} from "../../../lib/collection";
import { useLanguage } from "../../../lib/i18n";

interface SpeciesData {
  class_id: string;
  class_name: string;
  common_name?: string;
  scientific_name?: string;
  family?: string;
  description?: string;
  habitat?: string;
  native_region?: string;
  bloom_season?: string;
  colors?: string[];
  care_tips?: string[];
  fun_facts?: string[];
  image_url?: string;
  wikipedia_url?: string;
  gbif_url?: string;
}

interface SpeciesResponse {
  species?: SpeciesData;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeRequestError = error as {
      response?: { data?: { error?: string; detail?: string } };
      message?: string;
    };

    return (
      maybeRequestError.response?.data?.error ||
      maybeRequestError.response?.data?.detail ||
      maybeRequestError.message ||
      "Species not found"
    );
  }

  return "Species not found";
}

function getColorLabel(species: SpeciesData) {
  if (species.colors?.length) {
    return species.colors.join(", ");
  }

  const name = `${species.common_name || ""} ${species.class_name}`.toLowerCase();
  const colors = ["pink", "yellow", "orange", "red", "purple", "blue", "white"];
  const found = colors.find((color) => name.includes(color));
  return found ? found.charAt(0).toUpperCase() + found.slice(1) : "Mixed";
}

export default function SpeciesDetailPage() {
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const [species, setSpecies] = useState<SpeciesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    let isMounted = true;

    async function loadSpecies() {
      setIsLoading(true);
      setError(null);
      try {
        const response = (await getSpeciesDetails(id)) as SpeciesResponse;
        if (!isMounted) return;

        if (response.species) {
          setSpecies(response.species);
          setIsSaved(isInCollection(response.species.class_id));
        } else {
          setError("Species not found");
        }
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSpecies();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSave = () => {
    if (!species) return;

    if (isSaved) {
      removeFromCollection(species.class_id);
      setIsSaved(false);
      showSuccess("Removed from collection", "delete");
      return;
    }

    saveToCollection({
      class_id: species.class_id,
      class_name: species.class_name,
      common_name: species.common_name,
      scientific_name: species.scientific_name,
      family: species.family,
      native_region: species.native_region,
      color_hint: getColorLabel(species),
      image_url: species.image_url,
    });
    setIsSaved(true);
    showSuccess(`${species?.common_name || "Species"} saved to collection!`, "heart");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess("Link copied to clipboard!", "share");
    } catch {
      showError("Failed to copy link.");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
          <Skeleton className="h-8 w-32 rounded-lg mb-8" />
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Skeleton className="w-full sm:w-40 h-40 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <SkeletonText lines={4} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !species) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <EmptyState
            variant="generic"
            title="Species not found"
            description={error || `We could not find species with ID "${id}".`}
            actionLabel="Browse Gallery"
            actionHref="/gallery"
          />
        </div>
      </main>
    );
  }

  const commonName = species.common_name || species.class_name;
  const scientificName = species.scientific_name || species.class_id;
  const colorLabel = getColorLabel(species);
  const imageUrl = species.image_url || `/species/${species.class_id}.jpg`;
  const funFacts = species.fun_facts?.length ? species.fun_facts : [];

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
        <Breadcrumb
          items={[
            { label: t("nav.gallery"), href: "/gallery" },
            { label: commonName },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card overflow-hidden"
        >
          <div className="relative aspect-[16/9] bg-[#E8F5E9] dark:bg-[#2F382F] overflow-hidden">
            <Image
              src={imageUrl}
              alt={`${commonName} flower`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#242B24]/90 backdrop-blur text-xs font-medium text-[#5B8C5A] dark:text-[#7CB87C]">
                {species.family || "Unknown family"}
              </span>
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#242B24]/90 text-xs font-medium text-[#6B7B6C] dark:text-[#A3B0A4]">
              {species.class_id}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
                  {commonName}
                </h1>
                <p className="text-base text-[#6B7B6C] dark:text-[#A3B0A4] italic mt-1">
                  {scientificName}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSave}
                  className={`p-2.5 rounded-xl transition-all ${
                    isSaved
                      ? "bg-[#E8F5E9] dark:bg-[#2F382F] text-[#5B8C5A]"
                      : "bg-[#E8F5E9] dark:bg-[#2F382F] text-[#5B8C5A] hover:bg-[#5B8C5A] hover:text-white"
                  }`}
                  aria-label="Save species"
                  aria-pressed={isSaved}
                >
                  <Heart
                    className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#242B24] border border-[#E8EDE8] dark:border-[#2F382F] text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-all"
                  aria-label="Share species"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {species.description && (
              <p className="mt-4 text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] leading-relaxed">
                {species.description}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F]">
                <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] dark:text-[#7CB87C] mb-1">
                  <Sprout className="w-3 h-3" />
                  {t("result.family")}
                </div>
                <p className="text-sm font-medium text-[#2C3E2D] dark:text-[#E8EDE8]">
                  {species.family || "Unknown"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F]">
                <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] dark:text-[#7CB87C] mb-1">
                  <MapPin className="w-3 h-3" />
                  {t("result.origin")}
                </div>
                <p className="text-sm font-medium text-[#2C3E2D] dark:text-[#E8EDE8]">
                  {species.native_region || "Unknown"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F] col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] dark:text-[#7CB87C] mb-1">
                  <Palette className="w-3 h-3" />
                  {t("result.colors")}
                </div>
                <p className="text-sm font-medium text-[#2C3E2D] dark:text-[#E8EDE8]">
                  {colorLabel}
                </p>
              </div>
            </div>

            {funFacts.length > 0 && (
              <div className="mt-6 p-5 rounded-xl bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 border border-[#F4D03F]/20">
                <h3 className="text-sm font-semibold text-[#2C3E2D] dark:text-[#E8EDE8] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4A574]" />
                  {t("result.funFacts")}
                </h3>
                <ul className="space-y-2">
                  {funFacts.map((fact: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="text-sm text-[#6B7B6C] dark:text-[#A3B0A4] flex items-start gap-2"
                    >
                      <span className="text-[#D4A574] mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                      {fact}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {species.wikipedia_url && (
                <a
                  href={species.wikipedia_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#242B24] border border-[#E8EDE8] dark:border-[#2F382F] text-sm text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-colors"
                >
                  Wikipedia
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {species.gbif_url && (
                <a
                  href={species.gbif_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#242B24] border border-[#E8EDE8] dark:border-[#2F382F] text-sm text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-colors"
                >
                  GBIF
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
