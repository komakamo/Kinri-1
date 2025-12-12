/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  safelist: [
    'bg-indigo-50',
    'text-indigo-600',
    'bg-indigo-500',
    'border-indigo-500',
    'bg-rose-50',
    'text-rose-600',
    'bg-rose-500',
    'border-rose-500',
    'bg-emerald-50',
    'text-emerald-600',
    'bg-emerald-500',
    'border-emerald-500',
  ],
  plugins: [],
};
