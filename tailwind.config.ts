import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#c4c4c4',
          300: '#9a9a9a',
          400: '#6b6b6b',
          500: '#4a4a4a',
          600: '#2e2e2e',
          700: '#1c1c1c',
          800: '#121212',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        sora: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
