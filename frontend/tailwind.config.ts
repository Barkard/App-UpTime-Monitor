import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode (Primary)
        background: '#13121b',
        'surface-container-lowest': '#0e0d16',
        'surface-container-low': '#1b1b24',
        'surface-container': '#1f1f28',
        'surface-container-high': '#2a2933',
        'surface-container-highest': '#35343e',
        primary: '#c3c0ff',
        'primary-container': '#4f46e5',
        'on-primary': '#1d00a5',
        secondary: '#b9c7e0',
        'secondary-container': '#3c4a5e',
        'on-secondary-container': '#abb9d2',
        tertiary: '#ffb695',
        'tertiary-container': '#a44100',
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'on-surface': '#e4e1ee',
        'on-surface-variant': '#c7c4d8',
        outline: '#918fa1',
        'outline-variant': '#464555',
        'surface-tint': '#c3c0ff',
        'pulse-low': '#b9c7e066',
        'pulse-mid': '#c3c0ff99',
        'pulse-high': '#ffb4abcc',
        'badge-muted': '#3c4a5e4d',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        'label-mono': ['12px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        'data-mono': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '-0.01em' }],
        button: ['14px', { lineHeight: '20px', fontWeight: '600', letterSpacing: '0.02em' }],
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '48px',
        gutter: '20px',
      },
      borderRadius: {
        sm: '4px', DEFAULT: '4px', md: '8px', lg: '8px', xl: '12px', full: '9999px',
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-error': 'pulse-error 2s infinite',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(185, 199, 224, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(185, 199, 224, 0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '0.4' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        'pulse-error': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(0.95)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
