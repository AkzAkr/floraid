"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, WifiOff } from "lucide-react";
import Link from "next/link";

interface ErrorFallbackProps {
  error?: Error | string;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showHome?: boolean;
  variant?: "api" | "upload" | "generic" | "offline";
}

export default function ErrorFallback({
  error,
  onRetry,
  title,
  description,
  showHome = true,
  variant = "generic",
}: ErrorFallbackProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  const variants = {
    api: {
      title: "Failed to load data",
      description:
        "We couldn't fetch the data from our server. Please try again.",
      icon: AlertTriangle,
    },
    upload: {
      title: "Upload failed",
      description:
        "Something went wrong while uploading your image. Please try again.",
      icon: AlertTriangle,
    },
    offline: {
      title: "You're offline",
      description: "Please check your internet connection and try again.",
      icon: WifiOff,
    },
    generic: {
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try again.",
      icon: AlertTriangle,
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 sm:py-20 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[#E07A5F]/10 dark:bg-[#E07A5F]/20 flex items-center justify-center mb-5 sm:mb-6"
      >
        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-[#E07A5F]" />
      </motion.div>

      <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C3E2D] dark:text-[#E8EDE8]">
        {title || config.title}
      </h3>
      <p className="text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] mt-2 max-w-md mx-auto text-center">
        {description || config.description}
      </p>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 px-4 py-3 rounded-xl bg-[#E07A5F]/5 dark:bg-[#E07A5F]/10 border border-[#E07A5F]/20 max-w-md w-full"
        >
          <p className="text-xs sm:text-sm text-[#E07A5F] font-mono break-all">
            {errorMessage}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-col sm:flex-row items-center gap-3"
      >
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary inline-flex w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        {showHome && (
          <Link
            href="/"
            className="btn-secondary inline-flex w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
