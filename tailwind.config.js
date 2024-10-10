/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      md: "810px",
      lg: "1440px",
      sm: "576px",
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
