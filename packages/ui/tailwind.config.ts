// ═══════════════════════════════════════════════════════════════
// @xxxiii/ui — Shared Tailwind Configuration
// Institutional design system with light/dark mode
// Optimized for readability & accessibility (older readers)
// ═══════════════════════════════════════════════════════════════

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // All semantic colors use CSS custom properties defined in globals.css
        // This allows light/dark mode switching via .dark class on <html>
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          light: "var(--color-gold-light)",
        },
        blue: {
          DEFAULT: "var(--color-blue)",
          light: "var(--color-blue-light)",
        },
        green: "var(--color-green)",
        red: "var(--color-red)",
        purple: "var(--color-purple)",
        cyan: "var(--color-cyan)",
      },
      fontSize: {
        // Accessibility-first type scale — minimum 12px for ANY text
        "label": ["0.75rem", { lineHeight: "1.25rem", letterSpacing: "0.05em" }],     // 12px — smallest allowed (labels, badges)
        "caption": ["0.8125rem", { lineHeight: "1.375rem" }],                           // 13px — secondary info, metadata
        "body-sm": ["0.875rem", { lineHeight: "1.5rem" }],                              // 14px — compact body text
        "body": ["1rem", { lineHeight: "1.75rem" }],                                    // 16px — standard body
        "body-lg": ["1.125rem", { lineHeight: "1.875rem" }],                            // 18px — comfortable reading
        "heading-sm": ["1.125rem", { lineHeight: "1.625rem", fontWeight: "600" }],      // 18px — small headings
        "heading": ["1.375rem", { lineHeight: "1.875rem", fontWeight: "700" }],         // 22px — section headings
        "heading-lg": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }],        // 28px — page headings
        "display": ["2.25rem", { lineHeight: "2.75rem", fontWeight: "800" }],           // 36px — hero/display
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        // Touch-friendly spacing for older users
        "touch": "44px",  // minimum touch target (WCAG)
        "touch-sm": "36px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px var(--glow-color, rgba(201, 168, 76, 0.1))" },
          "100%": { boxShadow: "0 0 20px var(--glow-color, rgba(201, 168, 76, 0.15))" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(var(--color-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        "grid-pattern": "60px 60px",
      },
    },
  },
  plugins: [],
};

export default config;
