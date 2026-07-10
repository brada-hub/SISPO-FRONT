/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#663399',
        secondary: '#009999',
        accent: '#9c27b0',
      }
    },
  },
  plugins: [],
}
