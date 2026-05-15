/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8EEF7',
          100: '#C7D5EA',
          200: '#9AB3D7',
          400: '#4A75B2',
          500: '#1B498C',
          600: '#173E78',
          700: '#093A67',
          800: '#233D64',
          900: '#1E3F70',
        },
        accent: { 200: '#C9F4FF', 400: '#9AECFF', 500: '#5DDDF5' },
        surface: { base: '#F2F2F2', card: '#FFFFFF', dark: '#233D64' },
        ink: { 900: '#093A67', 700: '#313131', 500: '#737373', 400: '#B3B3B3' },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translate(0px,0px)' },
          '50%': { transform: 'translate(12px,-18px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.6' },
          '70%,100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'logo-spark': {
          '0%,100%': { opacity: '0.4', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'pulse-ring': 'pulse-ring 2.6s ease-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'logo-spark': 'logo-spark 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
