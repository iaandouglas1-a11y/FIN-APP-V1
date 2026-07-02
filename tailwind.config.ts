import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    "#0D2340",
          "navy-light": "#142d52",
          "navy-dark":  "#091829",
          green:   "#5DA832",
          "green-light": "#6fc23b",
          "green-dark":  "#4a8828",
        },
      },
      boxShadow: {
        soft:      "0 8px 24px rgba(13,35,64,.12)",
        glow:      "0 0 20px rgba(93, 168, 50, 0.25)",
        "glow-lg": "0 0 30px rgba(93, 168, 50, 0.4)",
        "navy":    "0 4px 24px rgba(13,35,64,.4)",
      },
    },
  },
  plugins: [],
};
export default config;
