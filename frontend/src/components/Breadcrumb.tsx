"use client";
"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { t } = useLanguage();

  return (
    <nav className="flex items-center gap-2 text-sm text-[#A3B0A4] mb-6 flex-wrap">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[#5B8C5A] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">{t("nav.home")}</span>
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#5B8C5A] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#2C3E2D] dark:text-[#E8EDE8] font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
