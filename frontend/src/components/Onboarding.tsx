"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Upload,
  BookOpen,
} from "lucide-react";
import { useOnboarding } from "../hooks/useOnboarding";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to FloraID!",
    description:
      "Identify any flower with AI. Upload a photo and discover 102+ species instantly.",
    icon: <Sparkles className="w-6 h-6 text-[#5B8C5A]" />,
  },
  {
    id: "upload",
    title: "Upload a Photo",
    description:
      "Drag & drop or click to upload. We support JPG, PNG, and WebP up to 5MB.",
    icon: <Upload className="w-6 h-6 text-[#5B8C5A]" />,
  },
  {
    id: "explore",
    title: "Explore & Save",
    description:
      "Browse the Gallery to learn more, or save results to your Collection.",
    icon: <BookOpen className="w-6 h-6 text-[#5B8C5A]" />,
  },
];

export default function Onboarding() {
  const { isFirstTime, isLoading, completeOnboarding, skipOnboarding } =
    useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && isFirstTime) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFirstTime]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    completeOnboarding();
  }, [completeOnboarding]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    skipOnboarding();
  }, [skipOnboarding]);

  if (isLoading || !isVisible) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[70] backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Centered Container */}
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-sm pointer-events-auto"
            >
              <div className="card p-6 sm:p-8 relative overflow-hidden">
                {/* Close button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#E8EDE8] dark:hover:bg-[#2F382F] transition-colors z-10"
                  aria-label="Skip tutorial"
                >
                  <X className="w-4 h-4 text-[#A3B0A4]" />
                </button>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "w-6 bg-[#5B8C5A]"
                          : i < currentStep
                            ? "w-1.5 bg-[#5B8C5A]/40"
                            : "w-1.5 bg-[#E8EDE8] dark:bg-[#2F382F]"
                      }`}
                    />
                  ))}
                </div>

                {/* Icon */}
                <motion.div
                  key={step.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-[#F4D03F]/20 flex items-center justify-center mb-5"
                >
                  {step.icon}
                </motion.div>

                {/* Content */}
                <motion.div
                  key={step.id + "-content"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-center"
                >
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] mt-3 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Actions */}
                <div className="mt-8">
                  {/* Navigation row */}
                  <div className="flex items-center gap-3">
                    {/* Prev button — only show if not first step */}
                    {!isFirstStep && (
                      <button
                        onClick={handlePrev}
                        className="p-2.5 rounded-xl hover:bg-[#E8EDE8] dark:hover:bg-[#2F382F] transition-colors text-[#6B7B6C] shrink-0"
                        aria-label="Previous step"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}

                    {/* Next / Done button — full width */}
                    <button
                      onClick={handleNext}
                      className="flex-1 btn-primary justify-center"
                    >
                      {isLastStep ? (
                        <>Get Started</>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Skip text */}
                  {!isLastStep && (
                    <button
                      onClick={handleSkip}
                      className="mt-4 text-xs text-[#A3B0A4] hover:text-[#6B7B6C] transition-colors w-full text-center"
                    >
                      Skip tutorial
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
