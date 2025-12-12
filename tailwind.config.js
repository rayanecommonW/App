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
        background: "#fff8fa",
        surface: "#ffffff",
        "surface-light": "#fff1f4",
        "surface-strong": "#ffe4eb",
        primary: "#ef233c",
        "primary-dim": "#d11d33",
        "primary-soft": "#ffc4cf",
        secondary: "#ffe7ed",
        accent: "#ff8fa3",
        danger: "#d7263d",
        warning: "#ffb347",
        muted: "#a17b88",
        "text-primary": "#14060f",
        "text-secondary": "#6f4d58",
        "border-subtle": "#f6d9e1",
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
