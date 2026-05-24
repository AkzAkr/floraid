"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Share2,
  Heart,
  Download,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "./Toast";
import { useLanguage } from "../lib/i18n";

interface TopPrediction {
  name: string;
  confidence: number;
}

interface ResultData {
  prediction: string;
  common_name: string;
  description: string;
  confidence: number;
  top_5: TopPrediction[];
  colors: string[];
  family: string;
  origin: string;
  fun_facts: string[];
}

interface ResultCardProps {
  result: ResultData;
  imageUrl: string;
  onShare?: () => void;
  onSave?: () => void;
  onRetry?: () => void;
}

function getConfidenceExplanation(
  result: ResultData,
  t: ReturnType<typeof useLanguage>["t"],
) {
  const confidence = result.confidence;
  const secondConfidence = result.top_5[1]?.confidence ?? 0;
  const margin = confidence - secondConfidence;
  const isCloseCall = result.top_5.length > 1 && margin < 0.15;

  if (confidence >= 0.9 && !isCloseCall) {
    return {
      label: t("result.confidence.very"),
      tone: "high",
      message: t("result.confidence.veryMessage"),
      note: null,
    };
  }

  if (confidence >= 0.7) {
    return {
      label: t("result.confidence.likely"),
      tone: "medium",
      message: t("result.confidence.likelyMessage"),
      note: isCloseCall ? t("result.confidence.closeNote") : null,
    };
  }

  if (confidence >= 0.5) {
    return {
      label: t("result.confidence.uncertain"),
      tone: "warning",
      message: t("result.confidence.uncertainMessage"),
      note: t("result.confidence.uncertainNote"),
    };
  }

  return {
    label: t("result.confidence.low"),
    tone: "danger",
    message: t("result.confidence.lowMessage"),
    note: t("result.confidence.lowNote"),
  };
}

export default function ResultCard({
  result,
  imageUrl,
  onShare,
  onSave,
  onRetry,
}: ResultCardProps) {
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `FloraID - ${result.common_name}`,
          text: `I identified a ${result.common_name} using FloraID!`,
          url: window.location.href,
        });
        showSuccess(t("toast.shared"), "share");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess(t("toast.linkCopied"), "share");
      }
      onShare?.();
    } catch {
      showError(t("toast.shareFailed"));
    }
  };

  const handleSave = () => {
    if (isSaved) {
      showSuccess(t("toast.alreadySaved"), "heart");
      return;
    }
    setIsSaved(true);
    showSuccess(t("toast.savedCollection"), "heart");
    onSave?.();
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `floraid-${result.prediction || "result"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess(t("toast.downloaded"), "save");
    } catch {
      showError(t("toast.downloadFailed"));
    }
  };

  const confidencePercent = (result.confidence * 100).toFixed(0);
  const confidenceInfo = getConfidenceExplanation(result, t);
  const confidenceStyles = {
    high: "bg-[#E8F5E9] border-[#5B8C5A]/20 text-[#3D6B3D] dark:bg-[#2F382F] dark:text-[#7CB87C]",
    medium:
      "bg-[#F4D03F]/10 border-[#F4D03F]/25 text-[#7A5B00] dark:text-[#F4D03F]",
    warning:
      "bg-[#E07A5F]/10 border-[#E07A5F]/25 text-[#9A4A35] dark:text-[#E07A5F]",
    danger:
      "bg-[#E07A5F]/15 border-[#E07A5F]/35 text-[#8E2F21] dark:text-[#F09A82]",
  }[confidenceInfo.tone];
  const ConfidenceIcon =
    confidenceInfo.tone === "warning" || confidenceInfo.tone === "danger"
      ? AlertTriangle
      : Info;
  const shouldShowConfidenceActions =
    confidenceInfo.tone === "warning" ||
    confidenceInfo.tone === "danger" ||
    Boolean(confidenceInfo.note);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="card overflow-hidden max-w-2xl mx-auto"
      role="article"
      aria-label={`Identification result: ${result.common_name}`}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-[#E8F5E9] to-[#F4D03F]/10">
        {!isImageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-[#E8EDE8] dark:bg-[#2F382F]" />
        )}
        <Image
          src={imageUrl}
          alt={`Uploaded flower identified as ${result.common_name}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 672px"
          quality={85}
          priority
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-[#5B8C5A] flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            {t("result.aiIdentified")}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]"
            >
              {result.common_name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-[#6B7B6C] dark:text-[#A3B0A4] italic mt-1"
            >
              {result.prediction}
            </motion.p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="shrink-0 text-center"
            aria-label={`Confidence score ${confidencePercent} percent`}
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#5B8C5A]">
              {confidencePercent}%
            </div>
            <div className="text-xs text-[#A3B0A4]">
              {t("result.confidence")}
            </div>
          </motion.div>
        </div>

        {/* Confidence Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-5"
          role="progressbar"
          aria-valuenow={parseInt(confidencePercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Identification confidence: ${confidencePercent} percent`}
        >
          <div className="confidence-bar h-2 sm:h-2.5 rounded-full bg-[#E8EDE8] dark:bg-[#2F382F] overflow-hidden">
            <motion.div
              className="confidence-bar-fill h-full rounded-full bg-[#5B8C5A]"
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence * 100}%` }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Confidence Explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.53 }}
          className={`mt-3 sm:mt-4 rounded-xl border p-3 sm:p-4 ${confidenceStyles}`}
        >
          <div className="flex items-start gap-3">
            <ConfidenceIcon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{confidenceInfo.label}</p>
              <p className="mt-1 text-xs sm:text-sm leading-5 text-[#6B7B6C] dark:text-[#A3B0A4]">
                {confidenceInfo.message}
              </p>
              {confidenceInfo.note && (
                <p className="mt-1 text-xs sm:text-sm leading-5 text-[#6B7B6C] dark:text-[#A3B0A4]">
                  {confidenceInfo.note}
                </p>
              )}
              {shouldShowConfidenceActions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllPredictions(true)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/80 dark:bg-[#242B24]/80 border border-[#5B8C5A]/20 text-xs font-medium text-[#3D6B3D] dark:text-[#7CB87C] hover:bg-[#5B8C5A] hover:text-white transition-colors"
                  >
                    {t("result.reviewAlternatives")}
                  </button>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-transparent border border-[#5B8C5A]/20 text-xs font-medium text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-colors"
                    >
                      {t("result.tryAnother")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 sm:mt-5"
        >
          <p className="text-sm leading-6 text-[#6B7B6C] dark:text-[#A3B0A4]">
            {result.description}
          </p>
        </motion.div>

        {/* Top 5 Predictions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 sm:mt-6"
        >
          <button
            onClick={() => setShowAllPredictions(!showAllPredictions)}
            aria-expanded={showAllPredictions}
            aria-controls="predictions-list"
            className="flex items-center gap-2 text-sm font-medium text-[#6B7B6C] dark:text-[#A3B0A4] hover:text-[#5B8C5A] transition-colors mb-3 focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] rounded px-1 py-0.5"
          >
            {t("result.topPredictions")}
            {showAllPredictions ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <AnimatePresence>
            {(showAllPredictions || result.top_5.length <= 3) && (
              <motion.div
                id="predictions-list"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                {result.top_5.map((pred, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    role="listitem"
                  >
                    <span className="text-xs text-[#A3B0A4] w-6">
                      #{i + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-[#2C3E2D] dark:text-[#E8EDE8] flex-1 truncate">
                      {pred.name}
                    </span>
                    <div
                      className="w-20 sm:w-24 lg:w-32 h-1.5 sm:h-2 rounded-full bg-[#E8EDE8] dark:bg-[#2F382F] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={Number((pred.confidence * 100).toFixed(2))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${pred.name} confidence ${(pred.confidence * 100).toFixed(2)} percent`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-[#5B8C5A]/30"
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.confidence * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-[#A3B0A4] w-12 text-right">
                      {(pred.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F]">
            <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] dark:text-[#7CB87C] mb-1">
              <Leaf className="w-3 h-3" aria-hidden="true" />
              {t("result.family")}
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#2C3E2D] dark:text-[#E8EDE8]">
              {result.family}
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F]">
            <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] dark:text-[#7CB87C] mb-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {t("result.origin")}
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#2C3E2D] dark:text-[#E8EDE8]">
              {result.origin}
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F] col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] dark:text-[#7CB87C] mb-1">
              <Palette className="w-3 h-3" aria-hidden="true" />
              {t("result.colors")}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {result.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#E8EDE8] dark:border-[#2F382F]"
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${i + 1}: ${color}`}
                  role="img"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 border border-[#F4D03F]/20"
        >
          <h4 className="text-sm font-semibold text-[#2C3E2D] dark:text-[#E8EDE8] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4A574]" aria-hidden="true" />
            {t("result.funFacts")}
          </h4>
          <ul className="space-y-1.5" role="list">
            {result.fun_facts.map((fact, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="text-xs sm:text-sm text-[#6B7B6C] dark:text-[#A3B0A4] flex items-start gap-2"
              >
                <span
                  className="text-[#D4A574] mt-1.5 w-1 h-1 rounded-full bg-current shrink-0"
                  aria-hidden="true"
                />
                {fact}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2"
        >
          <button
            onClick={handleSave}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Saved to collection" : "Save to collection"}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] ${
              isSaved
                ? "bg-[#E8F5E9] dark:bg-[#2F382F] text-[#5B8C5A]"
                : "bg-[#E8F5E9] dark:bg-[#2F382F] text-[#5B8C5A] hover:bg-[#5B8C5A] hover:text-white"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
              aria-hidden="true"
            />
            {isSaved ? t("result.saved") : t("result.save")}
          </button>
          <button
            onClick={handleShare}
            aria-label="Share identification result"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-[#242B24] border border-[#E8EDE8] dark:border-[#2F382F] text-xs sm:text-sm font-medium text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            {t("result.share")}
          </button>
          <button
            onClick={handleDownload}
            aria-label="Download identification image"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-[#242B24] border border-[#E8EDE8] dark:border-[#2F382F] text-xs sm:text-sm font-medium text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {t("result.download")}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
