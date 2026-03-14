import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: "#fff0f6",
          100: "#ffe0ec",
          200: "#ffc0d9",
          300: "#ff90bc",
          400: "#ff5599",
          500: "#ff2277",
          600: "#e6005e",
          700: "#c0004d",
          800: "#9a0040",
          900: "#7a0035",
        },
        sky: {
          kids: "#e0f4ff",
        },
        grass: {
          kids: "#f0fdf4",
        },
        sun: {
          kids: "#fefce8",
        },
      },
      fontFamily: {
        display: ["var(--font-noto-jp)", "sans-serif"],
      },
      fontSize: {
        "kids-xs": ["1rem", { lineHeight: "1.5" }],
        "kids-sm": ["1.25rem", { lineHeight: "1.6" }],
        "kids-base": ["1.5rem", { lineHeight: "1.7" }],
        "kids-lg": ["2rem", { lineHeight: "1.4" }],
        "kids-xl": ["2.5rem", { lineHeight: "1.3" }],
        "kids-2xl": ["3rem", { lineHeight: "1.2" }],
        "kids-3xl": ["4rem", { lineHeight: "1.1" }],
      },
      animation: {
        "bounce-once": "bounce 0.5s ease-in-out 1",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
