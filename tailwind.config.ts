import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Padhaaro brand palette — inspired by Hawa Mahal, Jaipur
        brand: {
          50: "#FBF2EC",
          100: "#F6E0D4",
          200: "#EBBEA9",
          300: "#DE9B7E",
          400: "#D07A57",
          500: "#C15A3F", // terracotta (primary)
          600: "#A8432B",
          700: "#8A3623",
          800: "#6E2C1E",
          900: "#4E211A",
        },
        plum: {
          50: "#F4F1F5",
          100: "#E6E0E8",
          200: "#CDC2D1",
          300: "#A99BB0",
          400: "#8A7A8E",
          500: "#6E5F72", // mauve border
          600: "#574A5B",
          700: "#463A4C",
          800: "#352C3A",
          900: "#251F29",
        },
        maroon: {
          500: "#7A3535",
          600: "#5C2A2A",
          700: "#4A2121",
        },
        gold: {
          400: "#D9AE63",
          500: "#C9974E",
          600: "#A97D3B",
        },
        cream: {
          DEFAULT: "#FAF6EF",
          100: "#FBF8F2",
          200: "#F4EDE1",
        },
        ink: {
          DEFAULT: "#2A2226",
          soft: "#5A4F55",
          faint: "#8B8189",
        },
        line: "#EBE1D4",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(42,34,38,0.04), 0 4px 16px rgba(42,34,38,0.06)",
        soft: "0 1px 3px rgba(42,34,38,0.06)",
        pop: "0 12px 40px rgba(42,34,38,0.16)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
