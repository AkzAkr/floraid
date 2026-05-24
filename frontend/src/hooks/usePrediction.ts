"use client";

import { useState, useCallback } from "react";
import { predictFlower } from "../lib/api";
import { useToast } from "../components/Toast";
import type { PredictResponse } from "../lib/api";

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
      "Failed to analyze image"
    );
  }

  return "Failed to analyze image";
}

export interface PredictionState {
  isLoading: boolean;
  result: PredictResponse | null;
  error: string | null;
}

export function usePrediction() {
  const { showSuccess, showError, showInfo } = useToast();

  const [state, setState] = useState<PredictionState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const predict = useCallback(
    async (file: File): Promise<boolean> => {
      // Reset state sebelum mulai
      setState({
        isLoading: true,
        result: null,
        error: null,
      });

      try {
        showInfo("Analyzing flower image...", "default");

        // 🔥 CALL API
        const result = await predictFlower(file);

        console.log("✅ API Response:", result); // DEBUG

        // Update state dengan hasil
        setState({
          isLoading: false,
          result: result,
          error: null,
        });

        showSuccess(
          `Identified: ${result.top_prediction.class_name} (${result.top_prediction.confidence_percent})`,
          "save",
        );

        return true;
      } catch (error: unknown) {
        console.error("❌ API Error:", error); // DEBUG

        const errorMessage = getErrorMessage(error);

        setState({
          isLoading: false,
          result: null,
          error: errorMessage,
        });

        showError(errorMessage, "delete");
        return false;
      }
    },
    [showSuccess, showError, showInfo],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    predict,
    reset,
  };
}

export default usePrediction;
