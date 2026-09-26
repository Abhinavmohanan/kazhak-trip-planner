import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        neu: {
          bg: 'var(--neu-bg)',
          card: 'var(--neu-card)',
          text: 'var(--neu-text)',
          muted: 'var(--neu-muted)',
          accent: 'var(--neu-accent)',
          teal: 'var(--neu-teal)',
          amber: 'var(--neu-amber)',
          rose: 'var(--neu-rose)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
