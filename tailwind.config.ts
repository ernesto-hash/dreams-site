import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        neon: {
          primary: "#7F5AF0",
          secondary: "#D1D1FF",
        },
        dark: {
          bg: "#0F0F1F",
          card: "#1A1A2E",
          input: "#121224",
        },
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        exo2: ["Exo 2", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },
      fontSize: {
        "hero-desktop": "4rem",
        "hero-mobile": "2rem",
        "subhero-desktop": "1.5rem",
        "subhero-mobile": "1rem",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(127, 90, 240, 0.5), 0 0 20px rgba(127, 90, 240, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(127, 90, 240, 0.8), 0 0 40px rgba(127, 90, 240, 0.5)"
          },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "particle": {
          "0%": {
            transform: "translate(0, 0)",
            opacity: "1",
          },
          "100%": {
            transform: "translate(var(--tx), var(--ty))",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "scale-in": "scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in": "fade-in 0.6s ease-out",
        "particle": "particle 2s ease-out forwards",
      },
      boxShadow: {
        "glow-neon": "0 0 20px rgba(127, 90, 240, 0.6), 0 0 40px rgba(127, 90, 240, 0.3)",
        "glow-neon-sm": "0 0 10px rgba(127, 90, 240, 0.4)",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0F0F1F 0%, #1A1A2E 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
