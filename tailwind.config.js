/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: { DEFAULT: '#0C0F1A', 50: '#F5F6FA', 100: '#E8EAF2', 200: '#CBD0E0', 300: '#9AA3BE', 400: '#6B789A', 500: '#4A5578', 600: '#333C5A', 700: '#212840', 800: '#151B2E', 900: '#0C0F1A' },
        teal: { DEFAULT: '#00C9A7', light: '#E0FAF5', dark: '#007A66' },
        gold: { DEFAULT: '#F5C842', light: '#FEF9E7', dark: '#B8920A' },
        coral: { DEFAULT: '#FF6B6B', light: '#FFF0F0', dark: '#C0392B' },
        azure: { DEFAULT: '#4F7CFF', light: '#EEF2FF', dark: '#2952CC' },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'count-in': 'countIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        countIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
}
