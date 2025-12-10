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
        // Cyberpunk dark theme
        background: "#0a0a0f",
        surface: "#12121a",
        "surface-light": "#1a1a24",
        primary: "#00ff88",
        "primary-dim": "#00cc6a",
        secondary: "#ff00aa",
        accent: "#00d4ff",
        danger: "#ff3366",
        warning: "#ffaa00",
        muted: "#666680",
        "text-primary": "#ffffff",
        "text-secondary": "#a0a0b0",
      },
      fontFamily: {
        mono: ["JetBrainsMono", "monospace"],
      },
    },
  },
  plugins: [],
};
