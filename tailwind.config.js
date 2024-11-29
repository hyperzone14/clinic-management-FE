/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      md: "1024px",
      lg: "1440px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      plugins: [require("tailwind-scrollbar")],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
