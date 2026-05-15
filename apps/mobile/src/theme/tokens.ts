// Design tokens espelhando tailwind.config.js — paleta extraída do Figma (Dashboard 2:2)
// Manter sincronizado com tailwind.config.

export const colors = {
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
  accent: {
    200: '#C9F4FF',
    400: '#9AECFF',
    500: '#5DDDF5',
  },
  surface: {
    base: '#F2F2F2',
    card: '#FFFFFF',
    dark: '#233D64',
  },
  ink: {
    900: '#093A67',
    700: '#313131',
    500: '#737373',
    400: '#B3B3B3',
    inverse: '#FFFFFF',
  },
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#1B498C',
} as const;

export const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  numeric: 'Sora_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  card: 30,
  pill: 31,
  full: 9999,
} as const;

export type Colors = typeof colors;
