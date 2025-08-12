/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'comic': ['"Comic Sans MS"', '"Comic Neue"', 'cursive', 'sans-serif'],
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '4/3': '4 / 3',
      },
    },
  },
  plugins: [],
}