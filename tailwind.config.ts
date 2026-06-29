import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f6",
          500: "#179d87",
          700: "#0e6f61"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15,23,42,.08)",
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow-lg": "0 0 30px rgba(99, 102, 241, 0.5)"
      },
      animation: {
        glow: "glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite"
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        }
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
export default config;
