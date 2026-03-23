/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal — sofisticada e feminina
        brand: {
          50:  '#fdf8f6',
          100: '#f9ede8',
          200: '#f2d5cb',
          300: '#e8b5a4',
          400: '#da8f78',
          500: '#c97055',  // Terracota suave — cor principal
          600: '#b05840',
          700: '#8f4432',
          800: '#733629',
          900: '#5e2e23',
        },
        neutral: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Acento discreto para promoções
        promo: {
          DEFAULT: '#9b6b4e',
          light: '#f5ede8',
        },
      },
      fontFamily: {
        // Display: elegante, feminino
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Corpo: limpo, legível
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        // Mono: para preços e dados
        mono: ['"DM Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'drawer': '-4px 0 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
