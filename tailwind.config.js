/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./html/**/*.{html,js}", "./js/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
