/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#4A90E2',
        'secondary-white': '#FFFFFF',
        'accent-coral': '#FF6B6B',
        'neutral-gray': '#F5F5F5',
        'text-dark': '#333333',
      }
    },
  },
  plugins: [],
}
