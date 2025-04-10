/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita o modo escuro baseado em classes
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e9e62',
          light: '#25c97c',
          dark: '#158c54',
        },
        secondary: {
          DEFAULT: '#2a2a2a',
          light: '#f0f0f0',
        },
        background: {
          dark: '#1a1a1a',
          light: '#ffffff',
        },
        text: {
          dark: '#ffffff',
          light: '#333333',
        }
      },
    },
  },
  plugins: [],
}