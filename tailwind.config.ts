import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a3a1a",
        paper: "#f0f7f0",
        mist: "#d4e4d4",
        sage: "#4a7c59",
        coral: "#22c55e",
        "coral-dark": "#166534",
        "coral-light": "#dcfce7",
        "coral-border": "#86efac",
        amber: "#d6a84f",
        violet: "#7d6b9f"
      }
    }
  },
  plugins: []
};

export default config;
