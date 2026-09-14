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
          navy:    "#161616",
          "navy-light": "#202020",
          "navy-dark":  "#121212",
          green:   "#5DA832",
          "green-light": "#6fc23b",
          "green-dark":  "#4a8828",
        },
        /* Design System 2.0 — superfícies em camadas (bg → surface → surface-2)
           em vez de "glass" com blur em tudo. Ver DESIGN-SYSTEM.md. */
        surface: {
          DEFAULT: "#161616", // surface
          2:       "#202020", // surface-2 (elevado / hover)
          border:  "#2E2E2E",
        },
        bg: {
          DEFAULT: "#0A0A0A",
        },
        ink: {
          primary:   "#F5F7FA",
          secondary: "#94A3B8",
          tertiary:  "#64748B",
        },
        danger: "#F04438",
        warning: "#F5A524",
        info: "#3E8FF0",
        /* slate-500 padrão (#64748b) tem apenas ~3.7:1 de contraste sobre o
           fundo #121212 do app — abaixo do mínimo AA (4.5:1) para texto
           pequeno. É usada em quase 100 lugares (labels, legendas, descrições).
           Clareamos apenas o degrau 500 para ~6:1, mantendo os demais tons. */
        slate: {
          500: "#8b98ac",
        },
      },
      borderRadius: {
        card: "16px",
        sheet: "24px",
      },
      boxShadow: {
        soft:      "0 8px 24px rgba(22,22,22,.12)",
        glow:      "0 0 20px rgba(93, 168, 50, 0.25)",
        "glow-lg": "0 0 30px rgba(93, 168, 50, 0.4)",
        "navy":    "0 4px 24px rgba(22,22,22,.4)",
        fab:       "0 8px 24px rgba(93, 168, 50, 0.45)",
        sheet:     "0 -8px 30px rgba(0,0,0,0.35)",
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
    },
  },
  plugins: [],
};
export default config;
