"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Eye,
  FileText,
  Leaf,
  Sparkles,
  Star,
  Upload,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../lib/i18n";

const FEATURED_SPECIES = [
  {
    id: "class_054",
    latin: "Helianthus annuus",
    common: "Sunflower",
    family: "Asteraceae",
    image: "/species/class_054.jpg",
  },
  {
    id: "class_074",
    latin: "Rosa",
    common: "Rose",
    family: "Rosaceae",
    image: "/species/class_074.jpg",
  },
  {
    id: "class_087",
    latin: "Magnolia soulangeana",
    common: "Magnolia",
    family: "Magnoliaceae",
    image: "/species/class_087.jpg",
  },
  {
    id: "class_013",
    latin: "Protea cynaroides",
    common: "King Protea",
    family: "Proteaceae",
    image: "/species/class_013.jpg",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-90px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const howItWorks = [
    {
      icon: Upload,
      step: "01",
      title: t("home.steps.upload.title"),
      desc: t("home.steps.upload.desc"),
    },
    {
      icon: Brain,
      step: "02",
      title: t("home.steps.analysis.title"),
      desc: t("home.steps.analysis.desc"),
    },
    {
      icon: FileText,
      step: "03",
      title: t("home.steps.results.title"),
      desc: t("home.steps.results.desc"),
    },
  ];
  const stats = [
    { icon: Leaf, value: "102", label: t("home.stats.species") },
    { icon: Eye, value: "84%", label: t("home.stats.accuracy") },
    { icon: Zap, value: "<5s", label: t("home.stats.response") },
    { icon: Star, value: "Top 5", label: t("home.stats.predictions") },
  ];

  return (
    <main className="min-h-screen bg-pattern">
      <Navbar />

      <section className="relative px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-24 pb-14 sm:pb-18 lg:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-80 lg:w-96 h-64 lg:h-96 bg-[#5B8C5A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-48 sm:w-56 lg:w-64 h-48 lg:h-64 bg-[#D4A574]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9] text-sm font-medium text-[#5B8C5A] mb-6 sm:mb-8 border border-[#5B8C5A]/10">
              <Sparkles className="w-4 h-4" />
              {t("home.badge")}
            </div>

            <h1 className="font-display text-responsive-hero font-bold text-[#2C3E2D] leading-tight">
              FloraID
              <span className="block gradient-text mt-1 sm:mt-2">
                {t("home.headline")}
              </span>
            </h1>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg text-[#6B7B6C] max-w-2xl mx-auto leading-relaxed px-2">
              {t("home.description")}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link
                href="/predict"
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <Upload className="w-4 h-4" />
                {t("home.startPredicting")}
              </Link>
              <Link
                href="/gallery"
                className="btn-secondary w-full sm:w-auto justify-center"
              >
                {t("home.browseGallery")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-9 sm:mt-11 flex items-center justify-center gap-4 sm:gap-8 overflow-x-auto pb-2 sm:pb-0 px-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 sm:gap-3 shrink-0"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#5B8C5A]" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm sm:text-base font-bold text-[#2C3E2D]">
                      {stat.value}
                    </div>
                    <div className="text-xs text-[#A3B0A4]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8F5E9]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="font-display text-responsive-section font-bold text-[#2C3E2D]"
            >
              {t("home.howTitle")}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-[#6B7B6C] mt-2 text-sm sm:text-base"
            >
              {t("home.howDescription")}
            </motion.p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 px-4 sm:px-0">
            {howItWorks.map((item, i) => (
              <AnimatedSection key={item.step}>
                <motion.div
                  variants={scaleIn}
                  className="relative text-center group"
                >
                  {i < 2 && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px">
                      <div className="w-full h-full bg-gradient-to-r from-[#E8EDE8] via-[#E8EDE8] to-transparent" />
                    </div>
                  )}
                  <motion.div
                    variants={fadeInUp}
                    custom={i}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#E8F5E9] to-[#F4D03F]/10 flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500"
                  >
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#5B8C5A]" />
                  </motion.div>
                  <motion.span
                    variants={fadeInUp}
                    custom={i + 0.3}
                    className="text-xs font-bold text-[#A3B0A4] tracking-widest"
                  >
                    {t("home.step")} {item.step}
                  </motion.span>
                  <motion.h3
                    variants={fadeInUp}
                    custom={i + 0.4}
                    className="font-display text-xl sm:text-2xl font-semibold text-[#2C3E2D] mt-2"
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p
                    variants={fadeInUp}
                    custom={i + 0.5}
                    className="text-sm sm:text-base text-[#6B7B6C] mt-3 leading-relaxed max-w-xs mx-auto"
                  >
                    {item.desc}
                  </motion.p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#FAFAF8] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#5B8C5A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4 px-2 sm:px-0">
            <div>
              <motion.h2
                variants={fadeInUp}
                custom={0}
                className="font-display text-responsive-section font-bold text-[#2C3E2D]"
              >
                {t("home.featuredTitle")}
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                custom={1}
                className="text-[#6B7B6C] mt-1 text-sm sm:text-base"
              >
                {t("home.featuredDescription")}
              </motion.p>
            </div>
            <motion.div variants={fadeInUp} custom={2}>
              <Link href="/gallery" className="btn-primary text-sm shrink-0">
                {t("home.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatedSection>

          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4 sm:px-0">
            {FEATURED_SPECIES.map((species, i) => (
              <motion.div
                key={species.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="snap-start shrink-0 w-64 sm:w-72"
              >
                <Link
                  href={`/species/${species.id}`}
                  className="card block overflow-hidden group h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={species.image}
                      alt={species.common}
                      fill
                      sizes="(max-width: 640px) 16rem, 18rem"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium inline-flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        {species.family}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-display text-lg font-semibold text-[#2C3E2D] group-hover:text-[#5B8C5A] transition-colors">
                      {species.common}
                    </h3>
                    <p className="text-sm text-[#6B7B6C] italic mt-1">
                      {species.latin}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9]/50 via-transparent to-[#F4D03F]/10 pointer-events-none" />
        <AnimatedSection className="max-w-3xl mx-auto text-center relative px-4">
          <motion.div
            variants={scaleIn}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#5B8C5A] to-[#3D6B3D] flex items-center justify-center mb-6 sm:mb-8 shadow-lg"
          >
            <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            custom={0}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C3E2D]"
          >
            {t("home.ctaTitle")}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            custom={1}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-[#6B7B6C] max-w-xl mx-auto"
          >
            {t("home.ctaDescription")}
          </motion.p>
          <motion.div
            variants={fadeInUp}
            custom={2}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/predict"
              className="btn-primary w-full sm:w-auto justify-center"
            >
              <Upload className="w-4 h-4" />
              {t("home.openPredict")}
            </Link>
            <Link
              href="/koleksi"
              className="btn-secondary w-full sm:w-auto justify-center"
            >
              {t("home.viewCollection")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </AnimatedSection>
      </section>

      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-[#E8EDE8] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B8C5A] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-[#2C3E2D]">
                  FloraID
                </span>
                <p className="text-xs text-[#A3B0A4]">
                  {t("home.footerSubtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              {["Next.js", "FastAPI", "TensorFlow", "Tailwind"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E8EDE8] text-xs font-medium text-[#6B7B6C]"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#A3B0A4] text-center md:text-right">
              {t("home.footerNote")}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
