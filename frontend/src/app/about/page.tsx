"use client";

import { motion, type Variants } from "framer-motion";
import {
  Briefcase,
  Cpu,
  Database,
  Eye,
  GitBranch,
  Globe,
  Leaf,
  Mail,
  Shield,
  Zap,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../lib/i18n";

const TECH_STACK = [
  { name: "Next.js 14", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  { name: "FastAPI", category: "Backend" },
  { name: "TensorFlow", category: "ML" },
  { name: "EfficientNet", category: "ML" },
  { name: "Python 3.11", category: "Backend" },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function AboutPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Database,
      title: t("about.features.species.title"),
      description: t("about.features.species.desc"),
    },
    {
      icon: Cpu,
      title: t("about.features.ai.title"),
      description: t("about.features.ai.desc"),
    },
    {
      icon: Eye,
      title: t("about.features.explain.title"),
      description: t("about.features.explain.desc"),
    },
    {
      icon: Zap,
      title: t("about.features.fast.title"),
      description: t("about.features.fast.desc"),
    },
    {
      icon: Shield,
      title: t("about.features.privacy.title"),
      description: t("about.features.privacy.desc"),
    },
    {
      icon: Globe,
      title: t("about.features.multi.title"),
      description: t("about.features.multi.desc"),
    },
  ];

  const stats = [
    { value: "7500+", label: t("about.stats.training") },
    { value: "102", label: t("about.stats.classes") },
    { value: "84.2%", label: t("about.stats.accuracy") },
    { value: "<5s", label: t("about.stats.inference") },
  ];

  const architecture = [
    {
      step: "1",
      title: t("about.arch.upload.title"),
      desc: t("about.arch.upload.desc"),
    },
    {
      step: "2",
      title: t("about.arch.preprocess.title"),
      desc: t("about.arch.preprocess.desc"),
    },
    {
      step: "3",
      title: t("about.arch.predict.title"),
      desc: t("about.arch.predict.desc"),
    },
    {
      step: "4",
      title: t("about.arch.explain.title"),
      desc: t("about.arch.explain.desc"),
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8] dark:bg-[#1A1F1A] transition-colors duration-300">
      <Navbar />

      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#5B8C5A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-48 h-48 bg-[#D4A574]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#5B8C5A] to-[#3D6B3D] flex items-center justify-center mb-6 sm:mb-8 shadow-lg">
              <Leaf className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
              {t("about.title")}
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[#6B7B6C] dark:text-[#A3B0A4] max-w-2xl mx-auto leading-relaxed px-4">
              {t("about.description")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 px-4 sm:px-6 bg-white dark:bg-[#242B24] border-y border-[#E8EDE8] dark:border-[#2F382F]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#5B8C5A] font-display">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-[#6B7B6C] dark:text-[#A3B0A4] mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
              {t("about.overviewTitle")}
            </h2>
            <p className="mt-2 text-[#6B7B6C] dark:text-[#A3B0A4] text-sm sm:text-base">
              {t("about.overviewSubtitle")}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={i}
                className="card p-5 sm:p-6 group hover:border-[#5B8C5A]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#5B8C5A]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#2C3E2D] dark:text-[#E8EDE8] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6B7B6C] dark:text-[#A3B0A4] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white dark:bg-[#242B24]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
              {t("about.stackTitle")}
            </h2>
            <p className="mt-2 text-[#6B7B6C] dark:text-[#A3B0A4] text-sm sm:text-base">
              {t("about.stackSubtitle")}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                variants={fadeInUp}
                custom={i}
                className="card p-4 sm:p-5 text-center group hover:shadow-lg transition-all duration-300"
              >
                <p className="text-[10px] sm:text-xs text-[#A3B0A4] uppercase tracking-wider mb-2">
                  {tech.category}
                </p>
                <p className="font-semibold text-sm sm:text-base text-[#2C3E2D] dark:text-[#E8EDE8] group-hover:text-[#5B8C5A] dark:group-hover:text-[#7CB87C] transition-colors">
                  {tech.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
              {t("about.archTitle")}
            </h2>
            <p className="mt-2 text-[#6B7B6C] dark:text-[#A3B0A4] text-sm sm:text-base">
              {t("about.archSubtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              {architecture.map((item, i) => (
                <div
                  key={item.step}
                  className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto"
                >
                  <div className="flex-1 sm:flex-none text-center sm:text-left">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto sm:mx-0 rounded-xl bg-[#E8F5E9] dark:bg-[#2F382F] flex items-center justify-center mb-2">
                      <span className="text-sm font-bold text-[#5B8C5A]">
                        {item.step}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[#2C3E2D] dark:text-[#E8EDE8]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#A3B0A4] mt-0.5">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden sm:block w-8 h-px bg-[#E8EDE8] dark:bg-[#2F382F]" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white dark:bg-[#242B24]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C3E2D] dark:text-[#E8EDE8]">
              {t("about.contactTitle")}
            </h2>
            <p className="mt-3 text-[#6B7B6C] dark:text-[#A3B0A4] text-sm sm:text-base">
              {t("about.contactDescription")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="mailto:anangismail57@gmail.com"
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <Mail className="w-4 h-4" />
                {t("about.sendEmail")}
              </a>
              <a
                href="https://github.com/AkzAkr/floraid"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto justify-center"
              >
                <GitBranch className="w-4 h-4" />
                {t("about.viewSource")}
              </a>
              <a
                href="https://www.linkedin.com/in/anang-ismail-2b326a409/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto justify-center"
              >
                <Briefcase className="w-4 h-4" />
                LinkedIn
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-[#E8EDE8] dark:border-[#2F382F]">
              <p className="text-xs text-[#A3B0A4]">
                {t("about.footerPassion")}
              </p>
              <p className="text-xs text-[#A3B0A4] mt-1">
                {t("about.footerLicense")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
