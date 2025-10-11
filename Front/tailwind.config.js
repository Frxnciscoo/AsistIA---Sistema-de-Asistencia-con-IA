/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}" // 👈 revisa HTML y TS de Angular
  ],
  safelist: [
    'text-blue-600',
    'text-red-600',
    'text-green-600',
    'text-gray-700',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl'
  ],
  theme: {
    extend: {}
  },
  plugins: [],
}
