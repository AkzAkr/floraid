// frontend/app/components/ConfidenceBar.tsx
"use client";

import { motion } from "framer-motion";

interface ConfidenceBarProps {
  value?: number;
  confidence?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
}

export default function ConfidenceBar({
  value,
  confidence,
  label,
  size = "md",
  showPercentage = true,
}: ConfidenceBarProps) {
  const confidenceValue = value ?? confidence ?? 0;
  const sizes = {
    sm: { height: "h-1.5", text: "text-xs" },
    md: { height: "h-2", text: "text-sm" },
    lg: { height: "h-3", text: "text-base" },
  };

  const s = sizes[size];

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className={`flex items-center justify-between mb-1.5 ${s.text}`}>
          {label && <span className="text-[#6B7B6C]">{label}</span>}
          {showPercentage && (
            <span className="font-semibold text-[#5B8C5A]">
              {(confidenceValue * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${s.height} bg-[#E8EDE8] rounded-full overflow-hidden`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidenceValue * 100}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[#5B8C5A] to-[#7CB87C]"
        />
      </div>
    </div>
  );
}
