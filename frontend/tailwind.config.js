/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#111111',
          900: '#141414',
          800: '#1c1c1c',
          700: '#242424',
          600: '#2e2e2e',
          500: '#3d3d3d',
          400: '#555555',
          300: '#888888',
          200: '#bbbbbb',
          100: '#d4d4d4',
          50:  '#EEEEEE',
        },
      },
    },
  },
  plugins: [],
};
