// frontend/app/components/ColorPalette.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface ColorPaletteProps {
  colors: string[];
  size?: "sm" | "md" | "lg";
  showHex?: boolean;
}

export default function ColorPalette({
  colors,
  size = "md",
  showHex = true,
}: ColorPaletteProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const copyToClipboard = (color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex items-center gap-3">
      {colors.map((color, i) => (
        <div key={i} className="relative group">
          <button
            onClick={() => copyToClipboard(color, i)}
            className={`${sizes[size]} rounded-xl shadow-sm border border-[#E8EDE8] cursor-pointer hover:scale-110 hover:shadow-md transition-all duration-300`}
            style={{ backgroundColor: color }}
            aria-label={`Copy color ${color}`}
          />

          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[#2C3E2D] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              {copiedIndex === i ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Copied
                </span>
              ) : (
                color
              )}
            </div>
          </div>

          {showHex && size === "md" && (
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[#A3B0A4] opacity-0 group-hover:opacity-100 transition-opacity">
              {color}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
