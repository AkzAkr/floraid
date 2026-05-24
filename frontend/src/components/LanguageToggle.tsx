"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface LanguageToggleProps {
  compact?: boolean;
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const nextLanguage = language === "en" ? "id" : "en";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={
        nextLanguage === "id"
          ? t("nav.switchToIndonesian")
          : t("nav.switchToEnglish")
      }
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8EDE8] dark:border-[#2F382F] bg-white/70 dark:bg-[#242B24]/70 text-[#6B7B6C] dark:text-[#A3B0A4] hover:border-[#5B8C5A] hover:text-[#5B8C5A] dark:hover:text-[#7CB87C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] ${
        compact
          ? "min-h-[44px] w-full px-3 py-2 text-base"
          : "h-9 px-2.5 text-xs font-semibold"
      }`}
    >
      <Languages className="w-4 h-4" aria-hidden="true" />
      <span>{language.toUpperCase()}</span>
    </button>
  );
}
