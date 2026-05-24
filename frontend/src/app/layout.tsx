import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "../components/ThemeProvider";
import { ToastProvider } from "../components/Toast";
import Onboarding from "../components/Onboarding";
import ScrollToTop from "../components/ScrollToTop";
import { LanguageProvider } from "../lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloraID - AI Flower Identification",
  description:
    "Identify 102 flower species with AI-powered image recognition. Upload a photo and discover detailed botanical information instantly.",
  keywords: [
    "flower identification",
    "AI",
    "botany",
    "plant recognition",
    "flora",
  ],
  authors: [{ name: "FloraID" }],
  openGraph: {
    title: "FloraID - AI Flower Identification",
    description:
      "Identify 102 flower species with AI-powered image recognition",
    type: "website",
  },
  // PWA manifest
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FloraID",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5B8C5A" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1F1A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
              <Onboarding />
              <ScrollToTop />
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
