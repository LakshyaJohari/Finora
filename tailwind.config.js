/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--color-base) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
        },
        teal: {
          DEFAULT: 'rgb(var(--color-teal) / <alpha-value>)',
          light: 'rgb(var(--color-teal-light) / <alpha-value>)',
          dark: 'rgb(var(--color-teal-dark) / <alpha-value>)',
          tint: 'rgb(var(--color-teal-tint) / <alpha-value>)',
        },
        marigold: {
          DEFAULT: 'rgb(var(--color-marigold) / <alpha-value>)',
          tint: 'rgb(var(--color-marigold-tint) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          tint: 'rgb(var(--color-danger-tint) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        softer: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
