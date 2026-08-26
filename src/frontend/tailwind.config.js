import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
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
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        gold: {
          DEFAULT: "oklch(var(--gold) / <alpha-value>)",
          foreground: "oklch(0.13 0.02 85)",
        },
        cyan: {
          DEFAULT: "oklch(var(--cyan) / <alpha-value>)",
          foreground: "oklch(var(--cyan-foreground))",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        smoke: "0 0 0 1px oklch(0.72 0.16 150 / 0.25) inset, 0 1px 0 0 oklch(0.94 0.015 60 / 0.08) inset, 0 14px 40px -18px oklch(0 0 0 / 0.7)",
        blue: "0 0 0 1px oklch(0.62 0.17 250 / 0.25) inset, 0 1px 0 0 oklch(0.94 0.015 60 / 0.08) inset, 0 14px 40px -18px oklch(0 0 0 / 0.7)",
        gold: "0 0 0 1px oklch(0.78 0.13 75 / 0.3) inset, 0 1px 0 0 oklch(0.94 0.015 60 / 0.08) inset, 0 14px 40px -18px oklch(0 0 0 / 0.7)",
        cyan: "0 0 0 1px oklch(0.82 0.16 195 / 0.35) inset, 0 0 20px -2px oklch(0.82 0.16 195 / 0.3), 0 1px 0 0 oklch(0.94 0.015 60 / 0.08) inset",
        emerald: "0 0 0 1px oklch(0.72 0.16 150 / 0.35) inset, 0 0 20px -2px oklch(0.72 0.16 150 / 0.3), 0 1px 0 0 oklch(0.94 0.015 60 / 0.08) inset",
        sapphire: "0 0 0 1px oklch(0.62 0.17 250 / 0.35) inset, 0 0 22px -2px oklch(0.62 0.17 250 / 0.3), 0 1px 0 0 oklch(0.94 0.015 60 / 0.08) inset",
        elevated: "0 20px 60px -20px oklch(0 0 0 / 0.7), 0 1px 0 0 oklch(0.94 0.015 60 / 0.06) inset",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "smoke-drift": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.5" },
          "50%": { transform: "translate3d(2%, -1%, 0) scale(1.08)", opacity: "0.8" },
          "100%": { transform: "translate3d(-2%, 1%, 0) scale(1.04)", opacity: "0.65" },
        },
        "ember-rise": {
          "0%": { transform: "translateY(0) translateX(0) scale(1)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(-120vh) translateX(20px) scale(0.4)", opacity: "0" },
        },
        "lantern-flicker": {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "0.75" },
          "60%": { opacity: "0.9" },
          "75%": { opacity: "0.7" },
        },
        "gold-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "crystal-pulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px oklch(0.62 0.17 250 / 0.4) inset, 0 0 22px -4px oklch(0.62 0.17 250 / 0.3)",
            opacity: "0.92",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px oklch(0.82 0.16 195 / 0.5) inset, 0 0 34px -2px oklch(0.62 0.17 250 / 0.5)",
            opacity: "1",
          },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "41%": { opacity: "1", filter: "brightness(1.1)" },
          "42%": { opacity: "0.7", filter: "brightness(0.85)" },
          "43%": { opacity: "1", filter: "brightness(1.1)" },
          "77%": { opacity: "1", filter: "brightness(1)" },
          "78%": { opacity: "0.85", filter: "brightness(0.9)" },
          "79%": { opacity: "1", filter: "brightness(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "smoke-drift": "smoke-drift 26s ease-in-out infinite alternate",
        "ember-rise": "ember-rise 12s linear infinite",
        "lantern-flicker": "lantern-flicker 4s ease-in-out infinite",
        "gold-shimmer": "gold-shimmer 5s linear infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "crystal-pulse": "crystal-pulse 5s ease-in-out infinite",
        "neon-flicker": "neon-flicker 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
