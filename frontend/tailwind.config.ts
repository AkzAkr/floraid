import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#5B8C5A",
          light: "#E8F5E9",
          dark: "#3D6B3D",
        },
        secondary: "#D4A574",
        accent: "#F4D03F",
        text: {
          primary: "#2C3E2D",
          secondary: "#6B7B6C",
          muted: "#A3B0A4",
        },
        border: "#E8EDE8",
        success: "#7CB87C",
        error: "#E07A5F",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(44, 62, 45, 0.04)",
        md: "0 4px 24px rgba(44, 62, 45, 0.06)",
        lg: "0 8px 40px rgba(44, 62, 45, 0.08)",
      },
      transitionTimingFunction: {
        custom: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};

export default config;
