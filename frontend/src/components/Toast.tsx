"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Heart,
  Share2,
  Save,
  Trash2,
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type ToastIcon = "default" | "save" | "share" | "heart" | "delete" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: ToastIcon;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    icon?: ToastIcon,
    duration?: number,
  ) => void;
  showSuccess: (message: string, icon?: ToastIcon) => void;
  showError: (message: string, icon?: ToastIcon) => void;
  showWarning: (message: string, icon?: ToastIcon) => void;
  showInfo: (message: string, icon?: ToastIcon) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const typeConfig = {
  success: {
    bg: "bg-[#E8F5E9] dark:bg-[#2F382F]",
    border: "border-[#5B8C5A]/20 dark:border-[#7CB87C]/20",
    text: "text-[#2C3E2D] dark:text-[#E8EDE8]",
    iconColor: "text-[#5B8C5A]",
    defaultIcon: CheckCircle,
  },
  error: {
    bg: "bg-[#E07A5F]/10 dark:bg-[#E07A5F]/20",
    border: "border-[#E07A5F]/20",
    text: "text-[#2C3E2D] dark:text-[#E8EDE8]",
    iconColor: "text-[#E07A5F]",
    defaultIcon: XCircle,
  },
  warning: {
    bg: "bg-[#F4D03F]/10 dark:bg-[#F4D03F]/20",
    border: "border-[#F4D03F]/20",
    text: "text-[#2C3E2D] dark:text-[#E8EDE8]",
    iconColor: "text-[#D4A574]",
    defaultIcon: AlertCircle,
  },
  info: {
    bg: "bg-[#E8EDE8] dark:bg-[#2F382F]",
    border: "border-[#A3B0A4]/20",
    text: "text-[#2C3E2D] dark:text-[#E8EDE8]",
    iconColor: "text-[#A3B0A4]",
    defaultIcon: Info,
  },
};

const iconMap = {
  default: null,
  save: Save,
  share: Share2,
  heart: Heart,
  delete: Trash2,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      icon?: ToastIcon,
      duration = 4000,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, type, icon, duration };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (message: string, icon?: ToastIcon) => showToast(message, "success", icon),
    [showToast],
  );
  const showError = useCallback(
    (message: string, icon?: ToastIcon) => showToast(message, "error", icon),
    [showToast],
  );
  const showWarning = useCallback(
    (message: string, icon?: ToastIcon) => showToast(message, "warning", icon),
    [showToast],
  );
  const showInfo = useCallback(
    (message: string, icon?: ToastIcon) => showToast(message, "info", icon),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 sm:gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = typeConfig[toast.type];
            const DefaultIcon = config.defaultIcon;
            const CustomIcon = toast.icon ? iconMap[toast.icon] : null;
            const IconToUse = CustomIcon || DefaultIcon;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm ${config.bg} ${config.border}`}
              >
                <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
                  <IconToUse className="w-5 h-5" />
                </div>
                <p className={`text-sm font-medium flex-1 ${config.text}`}>
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-[#A3B0A4]" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
