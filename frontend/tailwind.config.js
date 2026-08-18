/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // מאפשר שליטה בלחיצה דרך Class ב-HTML
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}