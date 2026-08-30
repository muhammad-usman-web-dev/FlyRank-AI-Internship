/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        canvas: "#EEF1EF",
        surface: "#FFFFFF",
        ink: "#1C2321",
        "ink-muted": "#74807C",
        accent: "#2F6F62",
        "accent-dark": "#25594F",
        "accent-soft": "#E4EFEC",
        received: "#F1F3F1",
        line: "#E2E6E3",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
