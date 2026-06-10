import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Midnight Whispers palette
        night: {
          950: "#06080d",
          900: "#0b1021",
          800: "#111827",
          700: "#1a2236",
          600: "#243049",
          500: "#334766",
        },
        ink: "#e8e0d4",
        paper: "#111827",
        mist: "#1e293b",
        sage: "#8a9ab5",
        coral: "#d4a853",
        "coral-dark": "#b8912e",
        "coral-light": "#d4a85315",
        "coral-border": "#d4a85340",
        amber: "#e8b94a",
        violet: "#a78bfa",
        ghost: "#ffffff0a",
      },
      fontFamily: {
        display: ['"LXGW WenKai"', "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        "mesh-1": "radial-gradient(ellipse at 20% 0%, rgba(212,168,83,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.06) 0%, transparent 50%)",
        "mesh-2": "radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.04) 0%, transparent 40%)",
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-lg": "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "amber": "0 4px 24px rgba(212,168,83,0.2)",
        "amber-lg": "0 8px 40px rgba(212,168,83,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(212,168,83,0.1)" },
          "100%": { boxShadow: "0 0 30px rgba(212,168,83,0.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    }
  },
  plugins: []
};

export default config;
