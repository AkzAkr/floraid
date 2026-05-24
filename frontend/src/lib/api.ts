// frontend/src/lib/api.ts
// FloraID API Client - Updated for backend integration

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Types matching backend response
export interface PredictionResult {
  rank: number;
  class_id: string;
  class_name: string;
  confidence: number;
  confidence_percent: string;
}

export interface PredictResponse {
  success: boolean;
  filename: string;
  top_prediction: PredictionResult;
  top_5_predictions: PredictionResult[];
  processing_time_ms: number;
  image_size: { width: number; height: number };
  color_palette: string[];
  timestamp: string;
}

export interface GradCAMResponse {
  success: boolean;
  filename: string;
  predicted_class: string;
  confidence: number;
  heatmap_base64: string;
  overlay_base64: string;
  processing_time_ms: number;
  timestamp: string;
}

export interface SpeciesListItem {
  class_id: string;
  class_name: string;
  display_name: string;
  common_name?: string;
  scientific_name?: string;
  family?: string;
  native_region?: string;
  bloom_season?: string;
  colors?: string[];
  color_hint?: string;
  image_url?: string;
  fun_facts_count?: number;
}

export interface SpeciesListResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  species: SpeciesListItem[];
}

// API Functions
export async function predictFlower(file: File): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<PredictResponse>("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function generateGradCAM(file: File): Promise<GradCAMResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<GradCAMResponse>("/gradcam", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function getSpeciesDetails(classId: string) {
  const response = await apiClient.get(`/species/${classId}`);
  return response.data;
}

export async function getSpeciesList(params?: {
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<SpeciesListResponse> {
  const response = await apiClient.get<SpeciesListResponse>("/species", {
    params: {
      query: params?.query,
      limit: params?.limit ?? 200,
      offset: params?.offset ?? 0,
    },
  });
  return response.data;
}

export default apiClient;
