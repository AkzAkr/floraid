"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke console atau service seperti Sentry
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto rounded-2xl bg-[#E07A5F]/10 dark:bg-[#E07A5F]/20 flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-[#E07A5F]" />
        </motion.div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] max-w-md mx-auto">
          We encountered an unexpected error. Do not worry, it is not your
          fault!
        </p>

        {/* Error details (hanya di development) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 px-4 py-3 rounded-xl bg-[#E07A5F]/5 dark:bg-[#E07A5F]/10 border border-[#E07A5F]/20 max-w-md w-full mx-auto text-left"
          >
            <p className="text-xs text-[#E07A5F] font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-[#A3B0A4] mt-1">
                Digest: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
