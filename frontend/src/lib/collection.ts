"use client";

import type { SpeciesListItem } from "./api";

export const COLLECTION_STORAGE_KEY = "floraid-collection";

export interface CollectionItem {
  id: string;
  className: string;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  colorHint: string;
  imageUrl: string;
  savedAt: string;
}

interface SpeciesLike {
  class_id: string;
  class_name?: string;
  display_name?: string;
  common_name?: string;
  scientific_name?: string;
  family?: string;
  native_region?: string;
  color_hint?: string;
  image_url?: string;
}

type LegacyCollectionItem = Partial<CollectionItem> & {
  latin?: string;
  common?: string;
  color?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeCollectionItem(item: LegacyCollectionItem): CollectionItem | null {
  const id = item.id;
  if (!id) return null;

  return {
    id,
    className: item.className || id,
    commonName: item.commonName || item.common || id,
    scientificName: item.scientificName || item.latin || id,
    family: item.family || "Unknown family",
    origin: item.origin || "Origin unknown",
    colorHint: item.colorHint || item.color || "Mixed",
    imageUrl: item.imageUrl || `/species/${id}.jpg`,
    savedAt: item.savedAt || new Date().toISOString(),
  };
}

export function readCollection(): CollectionItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(COLLECTION_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed
      .map((item) => normalizeCollectionItem(item))
      .filter((item): item is CollectionItem => Boolean(item));

    if (normalized.length !== parsed.length) {
      writeCollection(normalized);
    }

    return normalized;
  } catch {
    return [];
  }
}

export function writeCollection(items: CollectionItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(items));
}

export function isInCollection(id: string) {
  return readCollection().some((item) => item.id === id);
}

export function toCollectionItem(species: SpeciesLike): CollectionItem {
  return {
    id: species.class_id,
    className: species.class_name || species.class_id,
    commonName:
      species.common_name || species.display_name || species.class_name || species.class_id,
    scientificName: species.scientific_name || species.class_id,
    family: species.family || "Unknown family",
    origin: species.native_region || "Origin unknown",
    colorHint: species.color_hint || "Mixed",
    imageUrl: species.image_url || `/species/${species.class_id}.jpg`,
    savedAt: new Date().toISOString(),
  };
}

export function saveToCollection(species: SpeciesLike | SpeciesListItem) {
  const items = readCollection();
  const item = toCollectionItem(species);
  const exists = items.some((saved) => saved.id === item.id);

  if (exists) {
    return { item, added: false };
  }

  writeCollection([item, ...items]);
  window.dispatchEvent(new Event("floraid-collection-change"));
  return { item, added: true };
}

export function removeFromCollection(id: string) {
  const items = readCollection();
  const nextItems = items.filter((item) => item.id !== id);
  writeCollection(nextItems);
  window.dispatchEvent(new Event("floraid-collection-change"));
  return nextItems;
}
