/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#f7f4fb",
        "surface-light": "#f0ecf7",
        "surface-strong": "#e6dff1",
        primary: "#e53955",
        "primary-dim": "#cc2f48",
        "primary-soft": "#f88ca0",
        secondary: "#ffdce6",
        accent: "#ffb347",
        danger: "#d7263d",
        warning: "#f6b23c",
        muted: "#7a6a8a",
        "text-primary": "#1b102b",
        "text-secondary": "#5b4e6f",
        "border-subtle": "#e4deed",
      },
      fontFamily: {
        mono: ["JetBrainsMono", "monospace"],
      },
      borderRadius: {
        xl: "1.1rem",
        "2xl": "1.4rem",
        "3xl": "1.9rem",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(255, 92, 124, 0.25)",
      },
    },
  },
  plugins: [],
};
