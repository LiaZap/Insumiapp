/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand navy — extraído do Dashboard.tsx do Figma (#1B498C principal)
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
        // Cyan accent — chart highlights e badges (#9AECFF)
        accent: {
          200: '#C9F4FF',
          400: '#9AECFF',
          500: '#5DDDF5',
        },
        // Surface / background — page bg é #F2F2F2 (não branco puro!)
        surface: {
          base: '#F2F2F2',
          card: '#FFFFFF',
          dark: '#233D64',
        },
        // Text scale
        ink: {
          900: '#093A67',
          700: '#313131',
          500: '#737373',
          400: '#B3B3B3',
          inverse: '#FFFFFF',
        },
        // Estado
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#1B498C',
      },
      fontFamily: {
        sans: ['Figtree_400Regular', 'System'],
        medium: ['Figtree_500Medium', 'System'],
        semibold: ['Figtree_600SemiBold', 'System'],
        bold: ['Figtree_700Bold', 'System'],
        // Sora — números pequenos / badges
        sora: ['Sora_700Bold', 'System'],
      },
      borderRadius: {
        // Radii grandes do Figma
        card: '30px',
        pill: '31px',
        icon: '14px',
        iconLg: '18px',
      },
    },
  },
  plugins: [],
};
