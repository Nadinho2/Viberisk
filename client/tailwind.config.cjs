/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#020817",
        accent: "#22c55e",
        accentSoft: "#4ade80",
        danger: "#ef4444"
      }
    }
  },
  plugins: []
};

