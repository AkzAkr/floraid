"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#5B8C5A] to-[#3D6B3D] flex items-center justify-center mb-6 shadow-lg"
        >
          <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>

        {/* Loading Text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-xl sm:text-2xl font-semibold text-[#2C3E2D] dark:text-[#E8EDE8]"
        >
          Loading FloraID...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-[#A3B0A4] mt-2"
        >
          Preparing your botanical experience
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 w-48 sm:w-56 mx-auto"
        >
          <div className="h-1.5 rounded-full bg-[#E8EDE8] dark:bg-[#2F382F] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#5B8C5A] to-[#7CB87C]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Skeleton preview dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#5B8C5A]/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
