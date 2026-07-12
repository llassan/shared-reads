/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep forest green — literary, calm, trustworthy
        primary: {
          50: '#f2f7f4',
          100: '#e0ede5',
          200: '#c2dbcc',
          300: '#97c0a8',
          400: '#689f80',
          500: '#468262',
          600: '#33684d',
          700: '#29533f',
          800: '#224334',
          900: '#1d382c',
          950: '#0e1f18',
        },
        // Warm amber — bookmarks, highlights, calls to action
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        paper: '#faf9f7',
        ink: '#1c1917',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(28 25 23 / 0.04), 0 4px 12px rgb(28 25 23 / 0.05)',
        lift: '0 2px 4px rgb(28 25 23 / 0.06), 0 12px 24px rgb(28 25 23 / 0.10)',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        '44': '44px',
      },
      minWidth: {
        '44': '44px',
      },
    },
  },
  plugins: [],
}
