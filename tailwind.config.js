/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#e0ecff',
          200: '#c7dcfe',
          300: '#a4c4fd',
          400: '#79a2fa',
          500: '#4f7ef4',
          600: '#335eea',
          700: '#2647d7',
          800: '#233ab3',
          900: '#1e338a',
          950: '#142054',
        },
        navy: {
          800: '#0f172a',
          850: '#0c1322',
          900: '#090e1a',
          950: '#050811',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(51, 94, 234, 0.25)',
        'glow-lg': '0 0 40px -10px rgba(51, 94, 234, 0.35)',
      },
    },
  },
  plugins: [],
}
