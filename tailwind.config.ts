import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#f7f5ef",
        mist: "#e8eef2",
        sage: "#8aa39b",
        coral: "#d96c5f",
        amber: "#d6a84f",
        violet: "#7d6b9f"
      }
    }
  },
  plugins: []
};

export default config;
