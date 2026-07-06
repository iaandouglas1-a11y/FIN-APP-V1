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
        /* slate-500 padrão (#64748b) tem apenas ~3.7:1 de contraste sobre o
           fundo #091829 do app — abaixo do mínimo AA (4.5:1) para texto
           pequeno. É usada em quase 100 lugares (labels, legendas, descrições).
           Clareamos apenas o degrau 500 para ~6:1, mantendo os demais tons. */
        slate: {
          500: "#8b98ac",
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
