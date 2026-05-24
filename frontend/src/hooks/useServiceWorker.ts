"use client";

import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "floraid-onboarding-completed";

export function useOnboarding() {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      setIsFirstTime(!completed);
    } catch {
      // localStorage not available (e.g., private mode)
      setIsFirstTime(false);
    }
    setIsLoading(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
    setIsFirstTime(false);
  }, []);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
    } catch {
      // Ignore localStorage errors
    }
    setIsFirstTime(true);
  }, []);

  return {
    isFirstTime,
    isLoading,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}