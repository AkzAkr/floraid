export interface Prediction {
  class_name: string;
  latin_name: string;
  confidence: number;
  rank: number;
}

export interface FlowerResult {
  top_prediction: Prediction;
  all_predictions: Prediction[];
  gradcam_url?: string;
  color_palette: string[];
  image_url: string;
}

export interface FlowerSpecies {
  id: number;
  common_name: string;
  latin_name: string;
  family: string;
  origin: string;
  bloom_season: string;
  description: string;
  fun_facts: string[];
  care: {
    sunlight: string;
    water: string;
    temperature: string;
    soil: string;
  };
  color_palette: string[];
  tags: string[];
  image_url: string;
  accuracy: number;
  dataset_count: number;
}

export interface SavedFlower {
  id: string;
  timestamp: number;
  result: FlowerResult;
}
