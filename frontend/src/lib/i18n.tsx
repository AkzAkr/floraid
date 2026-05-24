"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "id";

type TranslationKey =
  | "nav.home"
  | "nav.predict"
  | "nav.gallery"
  | "nav.collection"
  | "nav.about"
  | "nav.lightMode"
  | "nav.darkMode"
  | "nav.switchToEnglish"
  | "nav.switchToIndonesian"
  | "predict.backHome"
  | "predict.badge"
  | "predict.title"
  | "predict.analyzing"
  | "predict.gradcam.button"
  | "predict.gradcam.loading"
  | "predict.gradcam.title"
  | "predict.gradcam.description"
  | "predict.gradcam.low"
  | "predict.gradcam.high"
  | "predict.gradcam.overlay"
  | "predict.gradcam.overlayHint"
  | "predict.gradcam.heatmap"
  | "predict.gradcam.howToRead"
  | "predict.gradcam.howToReadText"
  | "predict.emptyTitle"
  | "predict.emptyDescription"
  | "upload.dropHere"
  | "upload.dropPhoto"
  | "upload.browse"
  | "upload.camera"
  | "upload.ready"
  | "upload.analyzing"
  | "upload.changePhoto"
  | "upload.onlyOne"
  | "upload.tooLarge"
  | "upload.unsupported"
  | "upload.imagesOnly"
  | "upload.removed"
  | "result.aiIdentified"
  | "result.confidence"
  | "result.topPredictions"
  | "result.family"
  | "result.origin"
  | "result.colors"
  | "result.funFacts"
  | "result.reviewAlternatives"
  | "result.tryAnother"
  | "result.save"
  | "result.saved"
  | "result.share"
  | "result.download"
  | "result.confidence.very"
  | "result.confidence.veryMessage"
  | "result.confidence.likely"
  | "result.confidence.likelyMessage"
  | "result.confidence.closeNote"
  | "result.confidence.uncertain"
  | "result.confidence.uncertainMessage"
  | "result.confidence.uncertainNote"
  | "result.confidence.low"
  | "result.confidence.lowMessage"
  | "result.confidence.lowNote"
  | "toast.shared"
  | "toast.linkCopied"
  | "toast.shareFailed"
  | "toast.alreadySaved"
  | "toast.savedCollection"
  | "toast.downloaded"
  | "toast.downloadFailed"
  | "home.badge"
  | "home.headline"
  | "home.description"
  | "home.startPredicting"
  | "home.browseGallery"
  | "home.stats.species"
  | "home.stats.accuracy"
  | "home.stats.response"
  | "home.stats.predictions"
  | "home.howTitle"
  | "home.howDescription"
  | "home.step"
  | "home.steps.upload.title"
  | "home.steps.upload.desc"
  | "home.steps.analysis.title"
  | "home.steps.analysis.desc"
  | "home.steps.results.title"
  | "home.steps.results.desc"
  | "home.featuredTitle"
  | "home.featuredDescription"
  | "home.viewAll"
  | "home.ctaTitle"
  | "home.ctaDescription"
  | "home.openPredict"
  | "home.viewCollection"
  | "home.footerSubtitle"
  | "home.footerNote"
  | "gallery.title"
  | "gallery.descriptionPrefix"
  | "gallery.descriptionSuffix"
  | "gallery.searchPlaceholder"
  | "gallery.filters"
  | "gallery.family"
  | "gallery.colorHint"
  | "gallery.clearAll"
  | "gallery.showing"
  | "gallery.of"
  | "gallery.species"
  | "gallery.resetFilters"
  | "gallery.noSpecies"
  | "gallery.noResultsPrefix"
  | "gallery.noResultsSuffix"
  | "gallery.noFilterMatch"
  | "gallery.clearFilters"
  | "gallery.facts"
  | "gallery.filtersCleared"
  | "gallery.removed"
  | "gallery.savedSuffix"
  | "collection.title"
  | "collection.savedPrefix"
  | "collection.savedSuffix"
  | "collection.emptyTitle"
  | "collection.emptyDescription"
  | "collection.browseGallery"
  | "collection.saved"
  | "collection.details"
  | "collection.removed"
  | "collection.removeFailed"
  | "collection.loadFailed"
  | "collection.recently"
  | "about.title"
  | "about.description"
  | "about.stats.training"
  | "about.stats.classes"
  | "about.stats.accuracy"
  | "about.stats.inference"
  | "about.overviewTitle"
  | "about.overviewSubtitle"
  | "about.features.species.title"
  | "about.features.species.desc"
  | "about.features.ai.title"
  | "about.features.ai.desc"
  | "about.features.explain.title"
  | "about.features.explain.desc"
  | "about.features.fast.title"
  | "about.features.fast.desc"
  | "about.features.privacy.title"
  | "about.features.privacy.desc"
  | "about.features.multi.title"
  | "about.features.multi.desc"
  | "about.stackTitle"
  | "about.stackSubtitle"
  | "about.archTitle"
  | "about.archSubtitle"
  | "about.arch.upload.title"
  | "about.arch.upload.desc"
  | "about.arch.preprocess.title"
  | "about.arch.preprocess.desc"
  | "about.arch.predict.title"
  | "about.arch.predict.desc"
  | "about.arch.explain.title"
  | "about.arch.explain.desc"
  | "about.contactTitle"
  | "about.contactDescription"
  | "about.sendEmail"
  | "about.viewSource"
  | "about.footerPassion"
  | "about.footerLicense"
  | "recent.title"
  | "recent.description"
  | "recent.clear"
  | "recent.empty"
  | "recent.viewSpecies"
  | "recent.confidence"
  | "recent.removed"
  | "recent.cleared";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    "nav.home": "Home",
    "nav.predict": "Predict",
    "nav.gallery": "Gallery",
    "nav.collection": "Collection",
    "nav.about": "About",
    "nav.lightMode": "Light Mode",
    "nav.darkMode": "Dark Mode",
    "nav.switchToEnglish": "Switch to English",
    "nav.switchToIndonesian": "Switch to Indonesian",
    "predict.backHome": "Back to Home",
    "predict.badge": "AI-Powered Identification",
    "predict.title": "Identify Your Flower",
    "predict.analyzing": "Analyzing your flower...",
    "predict.gradcam.button": "Show Model Attention (GradCAM)",
    "predict.gradcam.loading": "Generating Heatmap...",
    "predict.gradcam.title": "Model Attention",
    "predict.gradcam.description":
      "Red and yellow areas show where the model focused most when making this prediction.",
    "predict.gradcam.low": "Low",
    "predict.gradcam.high": "High",
    "predict.gradcam.overlay": "Attention overlay",
    "predict.gradcam.overlayHint": "Focus on original photo",
    "predict.gradcam.heatmap": "Raw heatmap",
    "predict.gradcam.howToRead": "How to read this",
    "predict.gradcam.howToReadText":
      "The overlay helps you check whether FloraID looked at the flower area, not only the background or leaves. It is a guide, not a guarantee.",
    "predict.emptyTitle": "Ready to Identify",
    "predict.emptyDescription": "Upload a photo above",
    "upload.dropHere": "Drop here",
    "upload.dropPhoto": "Drop your flower photo",
    "upload.browse": "or click to browse",
    "upload.camera": "Use Camera",
    "upload.ready": "Ready",
    "upload.analyzing": "Analyzing...",
    "upload.changePhoto": "Change photo",
    "upload.onlyOne": "Only 1 photo will be processed.",
    "upload.tooLarge": "File too large. Maximum is 10MB.",
    "upload.unsupported": "Unsupported format.",
    "upload.imagesOnly": "Only images allowed.",
    "upload.removed": "Photo removed.",
    "result.aiIdentified": "AI Identified",
    "result.confidence": "confidence",
    "result.topPredictions": "Top Predictions",
    "result.family": "Family",
    "result.origin": "Origin",
    "result.colors": "Colors",
    "result.funFacts": "Fun Facts",
    "result.reviewAlternatives": "Review alternatives",
    "result.tryAnother": "Try another photo",
    "result.save": "Save",
    "result.saved": "Saved",
    "result.share": "Share",
    "result.download": "Download",
    "result.confidence.very": "Very confident",
    "result.confidence.veryMessage":
      "The model found a strong match. Still, verify with the flower shape and details if accuracy matters.",
    "result.confidence.likely": "Likely match",
    "result.confidence.likelyMessage":
      "This is probably the correct species, but similar flowers can produce close predictions.",
    "result.confidence.closeNote":
      "The top predictions are close, so compare the alternatives below.",
    "result.confidence.uncertain": "Uncertain",
    "result.confidence.uncertainMessage":
      "The model is not fully sure. Use this result as a suggestion, not a final identification.",
    "result.confidence.uncertainNote":
      "Check the top predictions and try a clearer photo if possible.",
    "result.confidence.low": "Low confidence",
    "result.confidence.lowMessage":
      "The prediction may be inaccurate. Lighting, background, crop, or an unsupported species can affect the result.",
    "result.confidence.lowNote":
      "Try uploading a close, sharp photo focused on the flower.",
    "toast.shared": "Shared successfully!",
    "toast.linkCopied": "Link copied to clipboard!",
    "toast.shareFailed": "Failed to share. Please try again.",
    "toast.alreadySaved": "Already in your collection!",
    "toast.savedCollection": "Saved to your collection!",
    "toast.downloaded": "Image downloaded!",
    "toast.downloadFailed": "Failed to download image.",
    "home.badge": "AI-Powered Flower Identification",
    "home.headline": "Know the Flower Faster",
    "home.description":
      "A focused flower identification app for predicting species, browsing the gallery, and saving discoveries in one calm workflow.",
    "home.startPredicting": "Start Predicting",
    "home.browseGallery": "Browse Gallery",
    "home.stats.species": "Species",
    "home.stats.accuracy": "Accuracy",
    "home.stats.response": "Response",
    "home.stats.predictions": "Predictions",
    "home.howTitle": "How It Works",
    "home.howDescription":
      "Prediction lives on its own page so the home stays clean.",
    "home.step": "STEP",
    "home.steps.upload.title": "Upload Photo",
    "home.steps.upload.desc":
      "Open the prediction page and choose a clear flower photo.",
    "home.steps.analysis.title": "AI Analysis",
    "home.steps.analysis.desc":
      "The EfficientNet model compares visual features across 102 classes.",
    "home.steps.results.title": "Read Results",
    "home.steps.results.desc":
      "See the best match, confidence score, top predictions, and details.",
    "home.featuredTitle": "Featured Species",
    "home.featuredDescription": "A quick peek at flowers from the database.",
    "home.viewAll": "View All",
    "home.ctaTitle": "Ready to Identify Your Flower?",
    "home.ctaDescription":
      "Head to the prediction workspace when you are ready to upload a photo.",
    "home.openPredict": "Open Predict",
    "home.viewCollection": "View Collection",
    "home.footerSubtitle": "AI Flower Identification",
    "home.footerNote": "Built with care for nature",
    "gallery.title": "Species Gallery",
    "gallery.descriptionPrefix": "Browse",
    "gallery.descriptionSuffix": "Oxford 102 flower species with local metadata",
    "gallery.searchPlaceholder": "Search by name, family, origin, or ID...",
    "gallery.filters": "Filters",
    "gallery.family": "Family",
    "gallery.colorHint": "Color Hint",
    "gallery.clearAll": "Clear all filters",
    "gallery.showing": "Showing",
    "gallery.of": "of",
    "gallery.species": "species",
    "gallery.resetFilters": "Reset filters",
    "gallery.noSpecies": "No species found",
    "gallery.noResultsPrefix": "No results for",
    "gallery.noResultsSuffix": "with the selected filters",
    "gallery.noFilterMatch": "No species match the selected filters",
    "gallery.clearFilters": "Clear Filters",
    "gallery.facts": "facts",
    "gallery.filtersCleared": "Filters cleared",
    "gallery.removed": "Removed from collection",
    "gallery.savedSuffix": "saved to collection",
    "collection.title": "My Collection",
    "collection.savedPrefix": "flowers saved from gallery and species details",
    "collection.savedSuffix": "flowers saved from gallery and species details",
    "collection.emptyTitle": "No saved flowers yet",
    "collection.emptyDescription":
      "Open the gallery and tap the heart button to save your favorite species.",
    "collection.browseGallery": "Browse Gallery",
    "collection.saved": "Saved",
    "collection.details": "Details",
    "collection.removed": "Flower removed from collection",
    "collection.removeFailed": "Failed to remove flower. Please try again.",
    "collection.loadFailed": "Failed to load your collection",
    "collection.recently": "recently",
    "about.title": "About FloraID",
    "about.description":
      "A comprehensive data science portfolio project demonstrating end-to-end machine learning pipeline, from data collection and model training to deployment and interactive visualization.",
    "about.stats.training": "Training Images",
    "about.stats.classes": "Flower Classes",
    "about.stats.accuracy": "Top-1 Accuracy",
    "about.stats.inference": "Inference Time",
    "about.overviewTitle": "Project Overview",
    "about.overviewSubtitle": "What makes FloraID unique",
    "about.features.species.title": "102 Species",
    "about.features.species.desc":
      "Comprehensive database covering 102 distinct flower species with detailed botanical information, origins, and characteristics.",
    "about.features.ai.title": "AI-Powered",
    "about.features.ai.desc":
      "Built with EfficientNetB0 transfer learning architecture, achieving 94%+ accuracy on test dataset through rigorous training.",
    "about.features.explain.title": "Explainable AI",
    "about.features.explain.desc":
      "Grad-CAM visualizations show exactly which parts of the flower the model focuses on, making AI decisions transparent.",
    "about.features.fast.title": "Fast Inference",
    "about.features.fast.desc":
      "Optimized model delivers predictions in under 2 seconds, with lightweight TFLite version available for mobile deployment.",
    "about.features.privacy.title": "Data Privacy",
    "about.features.privacy.desc":
      "All image processing happens securely. No photos are stored permanently without explicit user consent.",
    "about.features.multi.title": "Multilingual",
    "about.features.multi.desc":
      "Species information is being prepared for English and Indonesian, with room to expand later.",
    "about.stackTitle": "Technology Stack",
    "about.stackSubtitle": "Tools and frameworks powering FloraID",
    "about.archTitle": "System Architecture",
    "about.archSubtitle": "End-to-end pipeline from upload to prediction",
    "about.arch.upload.title": "Upload",
    "about.arch.upload.desc": "User uploads flower photo",
    "about.arch.preprocess.title": "Preprocess",
    "about.arch.preprocess.desc": "Resize, normalize, augment",
    "about.arch.predict.title": "Predict",
    "about.arch.predict.desc": "EfficientNet inference",
    "about.arch.explain.title": "Explain",
    "about.arch.explain.desc": "Grad-CAM visualization",
    "about.contactTitle": "Get In Touch",
    "about.contactDescription":
      "Have questions, feedback, or collaboration ideas? I would love to hear from you.",
    "about.sendEmail": "Send Email",
    "about.viewSource": "View Source",
    "about.footerPassion": "Built with passion for nature and machine learning.",
    "about.footerLicense": "FloraID is open source under MIT License.",
    "recent.title": "Recent Predictions",
    "recent.description": "Your latest identifications are saved on this device.",
    "recent.clear": "Clear history",
    "recent.empty": "Your recent predictions will appear here.",
    "recent.viewSpecies": "View species",
    "recent.confidence": "confidence",
    "recent.removed": "Removed from recent predictions",
    "recent.cleared": "Recent predictions cleared",
  },
  id: {
    "nav.home": "Beranda",
    "nav.predict": "Prediksi",
    "nav.gallery": "Galeri",
    "nav.collection": "Koleksi",
    "nav.about": "Tentang",
    "nav.lightMode": "Mode Terang",
    "nav.darkMode": "Mode Gelap",
    "nav.switchToEnglish": "Ganti ke Bahasa Inggris",
    "nav.switchToIndonesian": "Ganti ke Bahasa Indonesia",
    "predict.backHome": "Kembali ke Beranda",
    "predict.badge": "Identifikasi Bunga Berbasis AI",
    "predict.title": "Identifikasi Bungamu",
    "predict.analyzing": "Menganalisis bunga...",
    "predict.gradcam.button": "Lihat Fokus Model (GradCAM)",
    "predict.gradcam.loading": "Membuat Heatmap...",
    "predict.gradcam.title": "Fokus Model",
    "predict.gradcam.description":
      "Area merah dan kuning menunjukkan bagian yang paling diperhatikan model saat membuat prediksi.",
    "predict.gradcam.low": "Rendah",
    "predict.gradcam.high": "Tinggi",
    "predict.gradcam.overlay": "Overlay perhatian",
    "predict.gradcam.overlayHint": "Fokus pada foto asli",
    "predict.gradcam.heatmap": "Heatmap mentah",
    "predict.gradcam.howToRead": "Cara membacanya",
    "predict.gradcam.howToReadText":
      "Overlay membantu mengecek apakah FloraID melihat area bunga, bukan hanya latar belakang atau daun. Ini panduan, bukan jaminan.",
    "predict.emptyTitle": "Siap Mengidentifikasi",
    "predict.emptyDescription": "Unggah foto di atas",
    "upload.dropHere": "Lepaskan di sini",
    "upload.dropPhoto": "Letakkan foto bunga",
    "upload.browse": "atau klik untuk memilih",
    "upload.camera": "Gunakan Kamera",
    "upload.ready": "Siap",
    "upload.analyzing": "Menganalisis...",
    "upload.changePhoto": "Ganti foto",
    "upload.onlyOne": "Hanya 1 foto yang akan diproses.",
    "upload.tooLarge": "File terlalu besar. Maksimal 10MB.",
    "upload.unsupported": "Format tidak didukung.",
    "upload.imagesOnly": "Hanya gambar yang diperbolehkan.",
    "upload.removed": "Foto dihapus.",
    "result.aiIdentified": "Diidentifikasi AI",
    "result.confidence": "kepercayaan",
    "result.topPredictions": "Prediksi Teratas",
    "result.family": "Famili",
    "result.origin": "Asal",
    "result.colors": "Warna",
    "result.funFacts": "Fakta Menarik",
    "result.reviewAlternatives": "Lihat alternatif",
    "result.tryAnother": "Coba foto lain",
    "result.save": "Simpan",
    "result.saved": "Tersimpan",
    "result.share": "Bagikan",
    "result.download": "Unduh",
    "result.confidence.very": "Sangat yakin",
    "result.confidence.veryMessage":
      "Model menemukan kecocokan yang kuat. Tetap cocokkan dengan bentuk dan detail bunga jika akurasi penting.",
    "result.confidence.likely": "Kemungkinan cocok",
    "result.confidence.likelyMessage":
      "Ini kemungkinan spesies yang benar, tetapi bunga yang mirip bisa menghasilkan prediksi yang berdekatan.",
    "result.confidence.closeNote":
      "Prediksi teratas cukup dekat, jadi bandingkan alternatif di bawah.",
    "result.confidence.uncertain": "Belum yakin",
    "result.confidence.uncertainMessage":
      "Model belum sepenuhnya yakin. Gunakan hasil ini sebagai saran, bukan identifikasi final.",
    "result.confidence.uncertainNote":
      "Periksa prediksi teratas dan coba foto yang lebih jelas jika memungkinkan.",
    "result.confidence.low": "Kepercayaan rendah",
    "result.confidence.lowMessage":
      "Prediksi bisa kurang akurat. Pencahayaan, latar, potongan foto, atau spesies yang belum didukung dapat memengaruhi hasil.",
    "result.confidence.lowNote":
      "Coba unggah foto yang dekat, tajam, dan fokus pada bunga.",
    "toast.shared": "Berhasil dibagikan!",
    "toast.linkCopied": "Link disalin ke clipboard!",
    "toast.shareFailed": "Gagal membagikan. Coba lagi.",
    "toast.alreadySaved": "Sudah ada di koleksi!",
    "toast.savedCollection": "Disimpan ke koleksi!",
    "toast.downloaded": "Gambar berhasil diunduh!",
    "toast.downloadFailed": "Gagal mengunduh gambar.",
    "home.badge": "Identifikasi Bunga Berbasis AI",
    "home.headline": "Kenali Bunga Lebih Cepat",
    "home.description":
      "Aplikasi identifikasi bunga yang fokus untuk memprediksi spesies, menjelajahi galeri, dan menyimpan temuan dalam alur kerja yang tenang.",
    "home.startPredicting": "Mulai Prediksi",
    "home.browseGallery": "Jelajahi Galeri",
    "home.stats.species": "Spesies",
    "home.stats.accuracy": "Akurasi",
    "home.stats.response": "Respons",
    "home.stats.predictions": "Prediksi",
    "home.howTitle": "Cara Kerja",
    "home.howDescription":
      "Prediksi berada di halaman terpisah agar beranda tetap bersih.",
    "home.step": "LANGKAH",
    "home.steps.upload.title": "Unggah Foto",
    "home.steps.upload.desc":
      "Buka halaman prediksi dan pilih foto bunga yang jelas.",
    "home.steps.analysis.title": "Analisis AI",
    "home.steps.analysis.desc":
      "Model EfficientNet membandingkan fitur visual dari 102 kelas bunga.",
    "home.steps.results.title": "Baca Hasil",
    "home.steps.results.desc":
      "Lihat kecocokan terbaik, skor kepercayaan, prediksi teratas, dan detailnya.",
    "home.featuredTitle": "Spesies Unggulan",
    "home.featuredDescription": "Intip beberapa bunga dari database.",
    "home.viewAll": "Lihat Semua",
    "home.ctaTitle": "Siap Mengidentifikasi Bungamu?",
    "home.ctaDescription":
      "Buka ruang prediksi saat kamu siap mengunggah foto.",
    "home.openPredict": "Buka Prediksi",
    "home.viewCollection": "Lihat Koleksi",
    "home.footerSubtitle": "Identifikasi Bunga AI",
    "home.footerNote": "Dibuat dengan perhatian untuk alam",
    "gallery.title": "Galeri Spesies",
    "gallery.descriptionPrefix": "Jelajahi",
    "gallery.descriptionSuffix": "spesies bunga Oxford 102 dengan metadata lokal",
    "gallery.searchPlaceholder": "Cari berdasarkan nama, famili, asal, atau ID...",
    "gallery.filters": "Filter",
    "gallery.family": "Famili",
    "gallery.colorHint": "Petunjuk Warna",
    "gallery.clearAll": "Hapus semua filter",
    "gallery.showing": "Menampilkan",
    "gallery.of": "dari",
    "gallery.species": "spesies",
    "gallery.resetFilters": "Reset filter",
    "gallery.noSpecies": "Spesies tidak ditemukan",
    "gallery.noResultsPrefix": "Tidak ada hasil untuk",
    "gallery.noResultsSuffix": "dengan filter yang dipilih",
    "gallery.noFilterMatch": "Tidak ada spesies yang cocok dengan filter",
    "gallery.clearFilters": "Hapus Filter",
    "gallery.facts": "fakta",
    "gallery.filtersCleared": "Filter dibersihkan",
    "gallery.removed": "Dihapus dari koleksi",
    "gallery.savedSuffix": "disimpan ke koleksi",
    "collection.title": "Koleksiku",
    "collection.savedPrefix": "bunga tersimpan dari galeri dan detail spesies",
    "collection.savedSuffix": "bunga tersimpan dari galeri dan detail spesies",
    "collection.emptyTitle": "Belum ada bunga tersimpan",
    "collection.emptyDescription":
      "Buka galeri dan tekan tombol hati untuk menyimpan spesies favoritmu.",
    "collection.browseGallery": "Jelajahi Galeri",
    "collection.saved": "Disimpan",
    "collection.details": "Detail",
    "collection.removed": "Bunga dihapus dari koleksi",
    "collection.removeFailed": "Gagal menghapus bunga. Coba lagi.",
    "collection.loadFailed": "Gagal memuat koleksi",
    "collection.recently": "baru saja",
    "about.title": "Tentang FloraID",
    "about.description":
      "Proyek portofolio data science yang menunjukkan pipeline machine learning end-to-end, mulai dari pengumpulan data dan pelatihan model hingga deployment dan visualisasi interaktif.",
    "about.stats.training": "Gambar Latih",
    "about.stats.classes": "Kelas Bunga",
    "about.stats.accuracy": "Akurasi Top-1",
    "about.stats.inference": "Waktu Inferensi",
    "about.overviewTitle": "Gambaran Proyek",
    "about.overviewSubtitle": "Hal yang membuat FloraID berbeda",
    "about.features.species.title": "102 Spesies",
    "about.features.species.desc":
      "Database lengkap yang mencakup 102 spesies bunga berbeda dengan informasi botani, asal, dan karakteristik.",
    "about.features.ai.title": "Berbasis AI",
    "about.features.ai.desc":
      "Dibangun dengan arsitektur transfer learning EfficientNetB0 dan dilatih secara ketat pada dataset bunga.",
    "about.features.explain.title": "AI yang Transparan",
    "about.features.explain.desc":
      "Visualisasi Grad-CAM menunjukkan bagian bunga yang diperhatikan model, sehingga keputusan AI lebih mudah dipahami.",
    "about.features.fast.title": "Inferensi Cepat",
    "about.features.fast.desc":
      "Model dioptimalkan untuk memberikan prediksi cepat, dengan ruang pengembangan untuk deployment mobile.",
    "about.features.privacy.title": "Privasi Data",
    "about.features.privacy.desc":
      "Pemrosesan gambar dilakukan dengan aman. Foto tidak disimpan permanen tanpa persetujuan pengguna.",
    "about.features.multi.title": "Multi Bahasa",
    "about.features.multi.desc":
      "Informasi dan UI disiapkan untuk Bahasa Inggris dan Indonesia, dengan ruang untuk bahasa lain nantinya.",
    "about.stackTitle": "Teknologi",
    "about.stackSubtitle": "Tools dan framework yang menjalankan FloraID",
    "about.archTitle": "Arsitektur Sistem",
    "about.archSubtitle": "Pipeline end-to-end dari upload hingga prediksi",
    "about.arch.upload.title": "Upload",
    "about.arch.upload.desc": "Pengguna mengunggah foto bunga",
    "about.arch.preprocess.title": "Preproses",
    "about.arch.preprocess.desc": "Resize, normalisasi, augmentasi",
    "about.arch.predict.title": "Prediksi",
    "about.arch.predict.desc": "Inferensi EfficientNet",
    "about.arch.explain.title": "Penjelasan",
    "about.arch.explain.desc": "Visualisasi Grad-CAM",
    "about.contactTitle": "Hubungi Saya",
    "about.contactDescription":
      "Punya pertanyaan, masukan, atau ide kolaborasi? Saya senang mendengarnya.",
    "about.sendEmail": "Kirim Email",
    "about.viewSource": "Lihat Source",
    "about.footerPassion": "Dibuat dengan semangat untuk alam dan machine learning.",
    "about.footerLicense": "FloraID bersifat open source dengan Lisensi MIT.",
    "recent.title": "Prediksi Terbaru",
    "recent.description": "Identifikasi terakhirmu tersimpan di perangkat ini.",
    "recent.clear": "Hapus riwayat",
    "recent.empty": "Riwayat prediksi akan muncul di sini.",
    "recent.viewSpecies": "Lihat spesies",
    "recent.confidence": "kepercayaan",
    "recent.removed": "Dihapus dari prediksi terbaru",
    "recent.cleared": "Riwayat prediksi dibersihkan",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("floraid-language");
    if (saved === "en" || saved === "id") {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("floraid-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "id" : "en"),
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
