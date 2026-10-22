/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // dark: sigue al toggle de useTheme, no a la preferencia del SO
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Tokens de src/index.css como clases (text-muted, bg-surface2, border-accent…)
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        border: 'var(--border)',
        foreground: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        'accent-border': 'var(--accent-border)',
        'on-accent': 'var(--on-accent)',
        destructive: 'var(--destructive)',
        gold: 'var(--gold)',
        blue: { DEFAULT: 'var(--blue)' },
      },
      // `border` sin color usa el token del tema (no el gris fijo de Tailwind)
      borderColor: { DEFAULT: 'var(--border)' },
      fontFamily: {
        display: ['"Crimson Pro"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
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
