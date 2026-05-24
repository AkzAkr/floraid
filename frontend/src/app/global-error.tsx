"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-[#E07A5F]/10 dark:bg-[#E07A5F]/20 flex items-center justify-center mb-6"
          >
            <AlertTriangle className="w-10 h-10 text-[#E07A5F]" />
          </motion.div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
            Critical Error
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] max-w-md mx-auto">
            A critical error occurred that prevented the application from
            loading. Please try again.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-[#E07A5F]/5 dark:bg-[#E07A5F]/10 border border-[#E07A5F]/20 max-w-md w-full mx-auto text-left">
              <p className="text-xs text-[#E07A5F] font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <button onClick={reset} className="btn-primary inline-flex">
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </motion.div>
        </motion.div>
      </body>
    </html>
  );
}
