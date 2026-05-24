"use client";

import { useState, useEffect } from "react";
import { Leaf, Moon, Sun, GitBranch, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/predict", label: t("nav.predict") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/koleksi", label: t("nav.collection") },
    { href: "/about", label: t("nav.about") },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 dark:bg-[#1A1F1A]/80 backdrop-blur-md border-b border-[#E8EDE8] dark:border-[#2F382F] transition-colors duration-300"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] rounded-lg"
          aria-label="FloraID Home"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#5B8C5A] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Leaf
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              aria-hidden="true"
            />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8] transition-colors">
            FloraID
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-[#5B8C5A] dark:text-[#7CB87C]"
                    : "text-[#6B7B6C] dark:text-[#A3B0A4] hover:text-[#5B8C5A] dark:hover:text-[#7CB87C]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B8C5A] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-2 rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#2F382F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-[#F4D03F]" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-[#6B7B6C]" aria-hidden="true" />
            )}
          </button>

          <a
            href="https://github.com/AkzAkr/floraid"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View FloraID on GitHub (opens in new tab)"
            className="p-2 rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#2F382F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]"
          >
            <GitBranch
              className="w-5 h-5 text-[#6B7B6C] dark:text-[#A3B0A4] hover:text-[#5B8C5A] dark:hover:text-[#7CB87C] transition-colors"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#2F382F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {isMobileMenuOpen ? (
            <X
              className="w-5 h-5 text-[#2C3E2D] dark:text-[#E8EDE8]"
              aria-hidden="true"
            />
          ) : (
            <Menu
              className="w-5 h-5 text-[#2C3E2D] dark:text-[#E8EDE8]"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Mobile Menu — DI DALAM NAV seperti asli */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white dark:bg-[#242B24] border-t border-[#E8EDE8] dark:border-[#2F382F]"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="px-6 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block py-3 px-2 rounded-lg text-base font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? "text-[#5B8C5A] dark:text-[#7CB87C] bg-[#E8F5E9] dark:bg-[#2F382F]"
                      : "text-[#6B7B6C] dark:text-[#A3B0A4] hover:text-[#5B8C5A] dark:hover:text-[#7CB87C]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-[#E8EDE8] dark:border-[#2F382F]">
              <button
                onClick={() => toggleTheme()}
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="flex items-center gap-3 w-full py-3 px-2 rounded-lg text-base text-[#6B7B6C] dark:text-[#A3B0A4] hover:bg-[#E8F5E9]/50 dark:hover:bg-[#2F382F]/50 transition-colors min-h-[44px]"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-[#F4D03F]" aria-hidden="true" />
                ) : (
                  <Moon className="w-5 h-5 text-[#6B7B6C]" aria-hidden="true" />
                )}
                {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
              </button>
              <div className="pt-2">
                <LanguageToggle compact />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
