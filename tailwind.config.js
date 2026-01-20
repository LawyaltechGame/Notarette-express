/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false, // Disable dark mode - always use light theme
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4e9fb',
          100: '#e9d3f7',
          200: '#d3a7ef',
          300: '#bd7be8',
          400: '#a650e0',
          500: '#6E1EB5', // base
          600: '#5e1a9a',
          700: '#4e167f',
          800: '#3e1264',
          900: '#2e0e49',
        },
      },
    },
  },
  plugins: [],
};
