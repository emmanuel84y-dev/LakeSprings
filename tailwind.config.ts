import type { Config } from 'tailwindcss';

// ---------------------------------------------------------------------
// LakeSprings Hotels design tokens
//
// Palette:
//   reservoir  #0F2E2B  deep pine-lake green — header/footer, dark sections
//   still      #2F5049  mid green — secondary accents, hover states
//   mist       #EFF3EF  pale eucalyptus white — page background
//   sand       #E4E0D3  warm stone — card borders, dividers
//   brass      #A9793C  muted brass — CTAs, price highlights, eyebrows
//   ink        #16211D  near-black green-tinted text
//
// Type:
//   display — Fraunces (serif, used with restraint at large sizes)
//   body    — Inter (UI, forms, body copy)
// ---------------------------------------------------------------------

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        reservoir: { DEFAULT: '#0F2E2B', 50: '#E9EFEE', 900: '#0A211F' },
        still: '#2F5049',
        mist: '#EFF3EF',
        sand: '#E4E0D3',
        brass: { DEFAULT: '#A9793C', light: '#C79A5F', dark: '#8A6130' },
        ink: '#16211D',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      boxShadow: {
        dock: '0 20px 60px -15px rgba(15, 46, 43, 0.35)',
        card: '0 8px 30px -10px rgba(15, 46, 43, 0.18)',
      },
      backgroundImage: {
        waterline:
          'linear-gradient(90deg, transparent 0%, rgba(169,121,60,0.55) 20%, rgba(169,121,60,0.55) 80%, transparent 100%)',
      },
      maxWidth: {
        container: '1280px',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        rise: 'rise 0.7s ease-out both',
        ripple: 'ripple 0.6s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
