import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Terminal-style palette
        "terminal-900": "#030406", // near-black
        "terminal-800": "#0b0f12",
        "terminal-700": "#071018",
        "terminal-600": "#0b1a2b", // dark blue base
        "terminal-500": "#10222f",

        // Neon accents
        "neon-green": "#39FF14",
        "neon-green-600": "#00ff66",
        "neon-blue": "#00A3FF",

        // Muted helpers
        "muted-cyan": "#13b8b8",
        "muted-gray": "#94a3b8",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      boxShadow: {
        "neon-sm": "0 0 6px rgba(57,255,20,0.08), inset 0 0 6px rgba(0,163,255,0.03)",
        "neon-md": "0 0 12px rgba(57,255,20,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
