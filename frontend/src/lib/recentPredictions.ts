"use client";

import type { PredictResponse } from "./api";

export const RECENT_PREDICTIONS_STORAGE_KEY = "floraid-recent-predictions";
const MAX_RECENT_PREDICTIONS = 6;

export interface RecentPredictionItem {
  id: string;
  classId: string;
  className: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  confidencePercent: string;
  family: string;
  origin: string;
  imageUrl: string;
  predictedAt: string;
}

interface SpeciesDetailLike {
  common_name?: string;
  scientific_name?: string;
  family?: string;
  native_region?: string;
  image_url?: string;
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeRecentItem(
  item: Partial<RecentPredictionItem>,
): RecentPredictionItem | null {
  if (!item.classId && !item.id) return null;

  const classId = item.classId || item.id || "";
  return {
    id: item.id || `${classId}-${item.predictedAt || Date.now()}`,
    classId,
    className: item.className || classId,
    commonName: item.commonName || item.className || classId,
    scientificName: item.scientificName || classId,
    confidence: item.confidence ?? 0,
    confidencePercent:
      item.confidencePercent || `${((item.confidence ?? 0) * 100).toFixed(2)}%`,
    family: item.family || "Unknown family",
    origin: item.origin || "Origin unknown",
    imageUrl: item.imageUrl || `/species/${classId}.jpg`,
    predictedAt: item.predictedAt || new Date().toISOString(),
  };
}

export function readRecentPredictions(): RecentPredictionItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(RECENT_PREDICTIONS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed
      .map((item) => normalizeRecentItem(item))
      .filter((item): item is RecentPredictionItem => Boolean(item));

    if (normalized.length !== parsed.length) {
      writeRecentPredictions(normalized);
    }

    return normalized;
  } catch {
    return [];
  }
}

export function writeRecentPredictions(items: RecentPredictionItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    RECENT_PREDICTIONS_STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_RECENT_PREDICTIONS)),
  );
  window.dispatchEvent(new Event("floraid-recent-predictions-change"));
}

export function saveRecentPrediction(
  prediction: PredictResponse,
  species?: SpeciesDetailLike | null,
) {
  const topPrediction = prediction.top_prediction;
  const now = new Date().toISOString();
  const item: RecentPredictionItem = {
    id: `${topPrediction.class_id}-${now}`,
    classId: topPrediction.class_id,
    className: topPrediction.class_name,
    commonName: species?.common_name || topPrediction.class_name,
    scientificName: species?.scientific_name || topPrediction.class_id,
    confidence: topPrediction.confidence,
    confidencePercent: topPrediction.confidence_percent,
    family: species?.family || "Unknown family",
    origin: species?.native_region || "Origin unknown",
    imageUrl: species?.image_url || `/species/${topPrediction.class_id}.jpg`,
    predictedAt: now,
  };

  const existing = readRecentPredictions().filter(
    (recent) => recent.classId !== item.classId,
  );
  writeRecentPredictions([item, ...existing]);
  return item;
}

export function removeRecentPrediction(id: string) {
  const nextItems = readRecentPredictions().filter((item) => item.id !== id);
  writeRecentPredictions(nextItems);
  return nextItems;
}

export function clearRecentPredictions() {
  writeRecentPredictions([]);
}
