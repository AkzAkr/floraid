"use client";

import {
  useCallback,
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
} from "react";
import Image from "next/image";
import { useDropzone, type FileRejection } from "react-dropzone";
import {
  Upload,
  Camera,
  X,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./Toast";
import { useLanguage } from "../lib/i18n";

interface UploadZoneProps {
  onUpload: (file: File, previewUrl: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  resetKey?: number;
}

export default function UploadZone({
  onUpload,
  onClear,
  isLoading = false,
  resetKey = 0,
}: UploadZoneProps) {
  const { showError, showSuccess, showWarning } = useToast();
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{
    type: "size" | "type" | "multiple" | "unknown";
    message: string;
  } | null>(null);

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const clearError = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setUploadError(null);
  }, []);

  useEffect(() => {
    if (uploadError) {
      errorTimerRef.current = setTimeout(() => setUploadError(null), 5000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [uploadError]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    clearError();
  }, [resetKey, clearError]);

  const handleFile = useCallback(
    (file: File) => {
      clearError();

      if (file.size > 10 * 1024 * 1024) {
        setUploadError({ type: "size", message: `File too large. Max 10MB.` });
        showError(t("upload.tooLarge"), "delete");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setUploadError({ type: "type", message: "Only images allowed." });
        showError(t("upload.imagesOnly"), "delete");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setPreview((currentPreview) => {
        if (currentPreview) URL.revokeObjectURL(currentPreview);
        return previewUrl;
      });
      showSuccess(`"${file.name}" uploaded`, "save");
      onUpload(file, previewUrl);
    },
    [clearError, onUpload, showError, showSuccess, t],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      clearError();

      if (acceptedFiles.length > 1 || fileRejections.length > 1) {
        setUploadError({
          type: "multiple",
          message:
            "Only 1 photo can be uploaded. The first file will be processed.",
        });
        showWarning(t("upload.onlyOne"), "info");
      }

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const error = rejection.errors[0];

        if (error?.code === "file-too-large") {
          setUploadError({ type: "size", message: `File too large. Max 10MB.` });
          showError(t("upload.tooLarge"), "delete");
          return;
        }
        if (error?.code === "file-invalid-type") {
          setUploadError({
            type: "type",
            message: "Only JPG, PNG, WebP allowed.",
          });
          showError(t("upload.unsupported"), "delete");
          return;
        }
        setUploadError({
          type: "unknown",
          message: error?.message || "Invalid file.",
        });
        showError(error?.message || "Invalid file.", "delete");
        return;
      }

      if (acceptedFiles[0]) {
        const file = acceptedFiles[0];

        if (file.size > 10 * 1024 * 1024) {
          setUploadError({ type: "size", message: `File too large. Max 10MB.` });
          showError(t("upload.tooLarge"), "delete");
          return;
        }
        if (!file.type.startsWith("image/")) {
          setUploadError({ type: "type", message: "Only images allowed." });
          showError(t("upload.imagesOnly"), "delete");
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreview((currentPreview) => {
          if (currentPreview) URL.revokeObjectURL(currentPreview);
          return previewUrl;
        });
        showSuccess(`"${file.name}" uploaded`, "save");

        // 🔥 PASS KE PARENT (PredictPage)
        onUpload(file, previewUrl);
      }
    },
    [onUpload, showError, showSuccess, showWarning, clearError, t],
  );

  const handleCameraChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    event.target.value = "";
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      maxSize: 10 * 1024 * 1024,
      multiple: false,
    });

  const clearPreview = () => {
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    clearError();
    onClear?.();
    showWarning(t("upload.removed"), "delete");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="card relative overflow-hidden"
          >
            <div className="relative aspect-video">
              <Image
                src={preview}
                alt="Flower preview"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 672px"
                className="w-full h-full object-cover rounded-2xl"
              />
              <button
                onClick={clearPreview}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-md"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4 text-[#2C3E2D]" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-[#6B7B6C]">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#5B8C5A]" />
                    {t("upload.analyzing")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#5B8C5A]" />
                    {t("upload.ready")}
                  </>
                )}
              </div>
              <button
                onClick={clearPreview}
                className="px-4 py-2 text-sm text-[#6B7B6C] hover:text-[#E07A5F] transition-colors rounded-xl hover:bg-red-50"
              >
                {t("upload.changePhoto")}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div
              {...getRootProps()}
              className={`upload-zone p-10 sm:p-14 text-center cursor-pointer ${
                isDragActive ? "drag-active" : ""
              } ${
                isDragReject || uploadError ? "border-[#E07A5F] bg-red-50" : ""
              }`}
              role="button"
              tabIndex={0}
            >
              <input {...getInputProps()} />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleCameraChange}
                tabIndex={-1}
              />

              <div className="relative flex flex-col items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-[#F4D03F]/20 flex items-center justify-center shadow-sm"
                >
                  {isDragReject || uploadError ? (
                    <AlertTriangle className="w-8 h-8 text-[#E07A5F]" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#5B8C5A]" />
                  )}
                </motion.div>

                <div>
                  <p className="text-lg font-semibold text-[#2C3E2D]">
                    {isDragActive ? t("upload.dropHere") : t("upload.dropPhoto")}
                  </p>
                  <p className="text-sm text-[#A3B0A4] mt-1.5">
                    {t("upload.browse")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-[#E8F5E9] text-xs font-medium text-[#5B8C5A]">
                    JPG, PNG, WebP
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[#E8F5E9] text-xs font-medium text-[#5B8C5A]">
                    Max 10MB
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E8EDE8] text-sm font-medium text-[#6B7B6C] hover:border-[#5B8C5A] hover:text-[#5B8C5A] transition-all"
                >
                  <Camera className="w-4 h-4" />
                  {t("upload.camera")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#E07A5F]">
                {uploadError.message}
              </p>
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-100 rounded-full"
            >
              <X className="w-3.5 h-3.5 text-[#E07A5F]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
