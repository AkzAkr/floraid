"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Flame,
  Clock3,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import UploadZone from "../../components/UploadZone";
import ResultCard from "../../components/ResultCard";
import EmptyState from "../../components/EmptyState";
import ErrorFallback from "../../components/ErrorFallback";
import { useToast } from "../../components/Toast";
import {
  predictFlower,
  generateGradCAM,
  getSpeciesDetails,
  type PredictResponse,
  type GradCAMResponse,
} from "../../lib/api";
import { useLanguage } from "../../lib/i18n";
import {
  clearRecentPredictions,
  readRecentPredictions,
  removeRecentPrediction,
  saveRecentPrediction,
  type RecentPredictionItem,
} from "../../lib/recentPredictions";
import Link from "next/link";

interface SpeciesDetail {
  common_name?: string;
  scientific_name?: string;
  description?: string;
  colors?: string[];
  family?: string;
  native_region?: string;
  fun_facts?: string[];
  image_url?: string;
}

interface SpeciesResponse {
  species?: SpeciesDetail;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybeRequestError = error as {
      response?: { data?: { error?: string; detail?: string } };
      message?: string;
    };

    return (
      maybeRequestError.response?.data?.error ||
      maybeRequestError.response?.data?.detail ||
      maybeRequestError.message ||
      fallback
    );
  }

  return fallback;
}

// Transform API response ke format ResultCard
function transformApiResult(
  apiResult: PredictResponse,
  speciesDetail?: SpeciesDetail | null,
) {
  return {
    prediction:
      speciesDetail?.scientific_name || apiResult.top_prediction.class_id,
    common_name:
      speciesDetail?.common_name || apiResult.top_prediction.class_name,
    description:
      speciesDetail?.description ||
      `${speciesDetail?.common_name || apiResult.top_prediction.class_name} is one of the flower species recognized by FloraID.`,
    confidence: apiResult.top_prediction.confidence,
    top_5: apiResult.top_5_predictions.map((p) => ({
      name: p.class_name,
      confidence: p.confidence,
    })),
    colors: apiResult.color_palette?.length
      ? apiResult.color_palette
      : ["#FCD34D", "#8B4513", "#228B22", "#FFFFFF"],
    family: speciesDetail?.family || "Unknown",
    origin: speciesDetail?.native_region || "Unknown",
    fun_facts: speciesDetail?.fun_facts?.length
      ? speciesDetail.fun_facts
      : [
          `Identified with ${apiResult.top_prediction.confidence_percent} confidence`,
          "Save to your collection for future reference",
          "Share with friends",
        ],
  };
}

function formatRecentDate(date: string, language: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function RecentPredictions({
  items,
  onRemove,
  onClear,
}: {
  items: RecentPredictionItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const { language, t } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.45 }}
      className="mt-10 max-w-2xl mx-auto rounded-2xl border border-[#E8EDE8] dark:border-[#2F382F] bg-white/80 dark:bg-[#242B24]/80 overflow-hidden"
    >
      <div className="p-4 sm:p-5 border-b border-[#E8EDE8] dark:border-[#2F382F] flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2C3E2D] dark:text-[#E8EDE8]">
            <Clock3 className="w-4 h-4 text-[#5B8C5A]" />
            <h2 className="text-base font-semibold">{t("recent.title")}</h2>
          </div>
          <p className="mt-1 text-sm text-[#6B7B6C] dark:text-[#A3B0A4]">
            {items.length ? t("recent.description") : t("recent.empty")}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-medium text-[#6B7B6C] dark:text-[#A3B0A4] hover:text-[#E07A5F] transition-colors"
          >
            {t("recent.clear")}
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="divide-y divide-[#E8EDE8] dark:divide-[#2F382F]">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
            >
              <Link
                href={`/species/${item.classId}`}
                className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#E8F5E9] dark:bg-[#2F382F] shrink-0"
              >
                <Image
                  src={item.imageUrl}
                  alt={`${item.commonName} flower`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm sm:text-base font-semibold text-[#2C3E2D] dark:text-[#E8EDE8] truncate">
                    {item.commonName}
                  </h3>
                  <span className="text-xs font-semibold text-[#5B8C5A] shrink-0">
                    {(item.confidence * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-[#6B7B6C] dark:text-[#A3B0A4] italic truncate">
                  {item.scientificName}
                </p>
                <p className="mt-1 text-xs text-[#A3B0A4]">
                  {formatRecentDate(item.predictedAt, language)} ·{" "}
                  {t("recent.confidence")}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/species/${item.classId}`}
                  aria-label={t("recent.viewSpecies")}
                  className="p-2 rounded-lg text-[#6B7B6C] dark:text-[#A3B0A4] hover:bg-[#E8F5E9] dark:hover:bg-[#2F382F] hover:text-[#5B8C5A] transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove recent prediction"
                  className="p-2 rounded-lg text-[#6B7B6C] dark:text-[#A3B0A4] hover:bg-red-50 dark:hover:bg-[#2F382F] hover:text-[#E07A5F] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default function PredictPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { t } = useLanguage();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isGeneratingGradCAM, setIsGeneratingGradCAM] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictResponse | null>(null);
  const [gradcamResult, setGradcamResult] = useState<GradCAMResponse | null>(
    null,
  );
  const [speciesDetail, setSpeciesDetail] = useState<SpeciesDetail | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [recentPredictions, setRecentPredictions] = useState<
    RecentPredictionItem[]
  >([]);

  useEffect(() => {
    const loadRecentPredictions = () => {
      setRecentPredictions(readRecentPredictions());
    };

    loadRecentPredictions();
    window.addEventListener(
      "floraid-recent-predictions-change",
      loadRecentPredictions,
    );
    window.addEventListener("storage", loadRecentPredictions);

    return () => {
      window.removeEventListener(
        "floraid-recent-predictions-change",
        loadRecentPredictions,
      );
      window.removeEventListener("storage", loadRecentPredictions);
    };
  }, []);

  // Handle upload + auto predict
  const handleUpload = async (file: File, preview: string) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setPredictionResult(null);
    setGradcamResult(null);
    setSpeciesDetail(null);
    setError(null);
    setIsPredicting(true);

    try {
      showInfo("Analyzing flower...", "default");

      // 1. Predict
      const result = await predictFlower(file);
      console.log("✅ Predict:", result);
      setPredictionResult(result);

      // 2. Fetch species detail
      try {
        const species = (await getSpeciesDetails(
          result.top_prediction.class_id,
        )) as SpeciesResponse;
        console.log("✅ Species:", species);
        setSpeciesDetail(species.species ?? null);
        saveRecentPrediction(result, species.species ?? null);
      } catch {
        console.log("Species detail not available");
        saveRecentPrediction(result, null);
      }

      showSuccess(`Identified: ${result.top_prediction.class_name}`, "save");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to identify");
      setError(msg);
      showError(msg, "delete");
    } finally {
      setIsPredicting(false);
    }
  };

  // Handle GradCAM
  const handleGradCAM = async () => {
    if (!selectedFile) return;

    setIsGeneratingGradCAM(true);
    try {
      showInfo("Generating heatmap...", "default");
      const result = await generateGradCAM(selectedFile);
      setGradcamResult(result);
      showSuccess("Heatmap generated!", "save");
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Failed to generate GradCAM"), "delete");
    } finally {
      setIsGeneratingGradCAM(false);
    }
  };

  const handleRetry = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setPredictionResult(null);
    setGradcamResult(null);
    setSpeciesDetail(null);
    setError(null);
    setUploadResetKey((currentKey) => currentKey + 1);
  };

  const displayResult = predictionResult
    ? transformApiResult(predictionResult, speciesDetail)
    : null;

  const handleRemoveRecent = (id: string) => {
    setRecentPredictions(removeRecentPrediction(id));
    showSuccess(t("recent.removed"), "delete");
  };

  const handleClearRecent = () => {
    clearRecentPredictions();
    setRecentPredictions([]);
    showSuccess(t("recent.cleared"), "delete");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] transition-colors duration-300">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#6B7B6C] hover:text-[#5B8C5A] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {t("predict.backHome")}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9] text-sm font-medium text-[#5B8C5A] mb-4">
            <Sparkles className="w-4 h-4" /> {t("predict.badge")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E2D]">
            {t("predict.title")}
          </h1>
        </motion.div>

        {/* Upload Zone */}
        <UploadZone
          onUpload={handleUpload}
          onClear={handleRetry}
          isLoading={isPredicting}
          resetKey={uploadResetKey}
        />

        {/* Loading */}
        {isPredicting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[#5B8C5A]" />
            <p className="text-sm text-[#6B7B6C] animate-pulse">
              {t("predict.analyzing")}
            </p>
          </motion.div>
        )}

        {/* Result Card + Top 5 + GradCAM */}
        <AnimatePresence>
          {predictionResult && previewUrl && displayResult && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-8 space-y-6"
            >
              {/* Main Result Card */}
              <ResultCard
                result={displayResult}
                imageUrl={previewUrl}
                onShare={() => showSuccess("Shared!", "share")}
                onSave={() => showSuccess("Saved!", "heart")}
                onRetry={handleRetry}
              />

              {/* GradCAM Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGradCAM}
                disabled={isGeneratingGradCAM}
                className="w-full max-w-2xl mx-auto min-h-[48px] py-3 px-4 rounded-xl border border-[#5B8C5A]/25 bg-[#E8F5E9] dark:bg-[#2F382F] text-[#3D6B3D] dark:text-[#7CB87C] hover:bg-[#5B8C5A] hover:text-white hover:border-[#5B8C5A] disabled:opacity-60 disabled:hover:bg-[#E8F5E9] disabled:hover:text-[#3D6B3D] disabled:dark:hover:bg-[#2F382F] disabled:dark:hover:text-[#7CB87C] font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isGeneratingGradCAM ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("predict.gradcam.loading")}
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" aria-hidden="true" />
                    {t("predict.gradcam.button")}
                  </>
                )}
              </motion.button>

              {/* GradCAM Results */}
              <AnimatePresence>
                {gradcamResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-2xl mx-auto rounded-2xl border border-[#5B8C5A]/20 bg-white/80 dark:bg-[#243024]/85 shadow-sm overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 border-b border-[#5B8C5A]/15">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-[#2C3E2D] dark:text-[#E8F5E9]">
                            {t("predict.gradcam.title")}
                          </h4>
                          <p className="mt-1 text-sm leading-relaxed text-[#6B7B6C] dark:text-[#B8C9B8]">
                            {t("predict.gradcam.description")}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 pt-1 text-xs text-[#6B7B6C] dark:text-[#B8C9B8]">
                          <span>{t("predict.gradcam.low")}</span>
                          <div className="h-2 w-20 rounded-full bg-gradient-to-r from-blue-600 via-yellow-300 to-red-500" />
                          <span>{t("predict.gradcam.high")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="overflow-hidden rounded-2xl border border-[#5B8C5A]/20 bg-[#101810]">
                        <Image
                          src={gradcamResult.overlay_base64}
                          alt="GradCAM overlay"
                          width={512}
                          height={512}
                          unoptimized
                          className="w-full h-auto object-cover"
                        />
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                          <p className="text-sm font-medium text-[#E8F5E9]">
                            {t("predict.gradcam.overlay")}
                          </p>
                          <p className="text-xs text-[#B8C9B8]">
                            {t("predict.gradcam.overlayHint")}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[0.75fr_1fr]">
                        <div className="overflow-hidden rounded-xl border border-[#5B8C5A]/15 bg-[#101810]">
                          <Image
                            src={gradcamResult.heatmap_base64}
                            alt="GradCAM heatmap"
                            width={512}
                            height={512}
                            unoptimized
                            className="w-full h-auto object-cover"
                          />
                          <p className="px-3 py-2 text-center text-xs text-[#B8C9B8]">
                            {t("predict.gradcam.heatmap")}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#5B8C5A]/15 bg-[#E8F5E9]/60 dark:bg-[#2F382F] p-4 flex flex-col justify-center">
                          <p className="text-sm font-medium text-[#2C3E2D] dark:text-[#E8F5E9]">
                            {t("predict.gradcam.howToRead")}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-[#6B7B6C] dark:text-[#B8C9B8]">
                            {t("predict.gradcam.howToReadText")}
                          </p>
                          <div className="mt-4 flex sm:hidden items-center gap-2 text-xs text-[#6B7B6C] dark:text-[#B8C9B8]">
                            <span>{t("predict.gradcam.low")}</span>
                            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-600 via-yellow-300 to-red-500" />
                            <span>{t("predict.gradcam.high")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mt-6">
            <ErrorFallback
              variant="upload"
              error={error}
              onRetry={handleRetry}
              showHome={false}
            />
          </div>
        )}

        {/* Empty */}
        {!previewUrl && !error && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <EmptyState
                variant="upload"
                title={t("predict.emptyTitle")}
                description={t("predict.emptyDescription")}
              />
            </motion.div>

            <RecentPredictions
              items={recentPredictions}
              onRemove={handleRemoveRecent}
              onClear={handleClearRecent}
            />
          </>
        )}
      </div>
    </main>
  );
}
