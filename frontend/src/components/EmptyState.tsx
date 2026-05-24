"use client";

import { motion } from "framer-motion";
import {
  Search,
  Heart,
  Leaf,
  FolderOpen,
  ImageOff,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  variant?: "search" | "collection" | "gallery" | "upload" | "generic";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

type EmptyStateConfig = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

const variants: Record<NonNullable<EmptyStateProps["variant"]>, EmptyStateConfig> = {
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters",
  },
  collection: {
    icon: Heart,
    title: "No saved flowers yet",
    description: "Start identifying and save your favorite flowers",
    actionLabel: "Start Identifying",
    actionHref: "/",
  },
  gallery: {
    icon: FolderOpen,
    title: "No species found",
    description: "Try adjusting your search or filter criteria",
  },
  upload: {
    icon: ImageOff,
    title: "No image uploaded",
    description: "Upload a photo to identify the flower",
  },
  generic: {
    icon: Leaf,
    title: "Nothing here yet",
    description: "Check back later for updates",
  },
};

export default function EmptyState({
  variant = "generic",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 sm:py-20 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[#E8F5E9] dark:bg-[#2F382F] flex items-center justify-center mb-5 sm:mb-6"
      >
        {icon || (
          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-[#5B8C5A]/40 dark:text-[#7CB87C]/40" />
        )}
      </motion.div>

      <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C3E2D] dark:text-[#E8EDE8]">
        {title || config.title}
      </h3>
      <p className="text-sm sm:text-base text-[#6B7B6C] dark:text-[#A3B0A4] mt-2 max-w-md mx-auto">
        {description || config.description}
      </p>

      {(actionLabel || config.actionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          {actionHref ? (
            <Link
              href={actionHref || config.actionHref || "/"}
              className="btn-primary inline-flex"
              onClick={onAction}
            >
              {actionLabel || config.actionLabel}
            </Link>
          ) : onAction ? (
            <button onClick={onAction} className="btn-primary inline-flex">
              {actionLabel || config.actionLabel}
            </button>
          ) : null}
        </motion.div>
      )}
    </motion.div>
  );
}
