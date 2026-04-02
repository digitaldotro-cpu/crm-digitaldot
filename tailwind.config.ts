import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3f5f7',
        foreground: '#101418',
        muted: '#6f7b85',
        panel: '#ffffff',
        line: '#d8e0e6',
        brand: {
          DEFAULT: '#0e7a6c',
          dark: '#095046',
          soft: '#d8f5ef'
        },
        accent: '#f39c12',
        danger: '#c0392b'
      },
      boxShadow: {
        panel: '0 8px 24px rgba(16, 20, 24, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
