/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f8fafc',
        primary: '#ff6b6b',
        'primary-dark': '#ff5252',
        secondary: '#4ecdc4',
        accent: '#45b7d1',
        success: '#51cf66',
        warning: '#ffd43b',
        error: '#ff6b6b',
        coral: '#ff7f7f',
        pink: '#f472b6',
        orange: '#ff8c42',
        yellow: '#facc15',
        green: '#4ade80',
        blue: '#60a5fa',
        emerald: '#10b981',
        'glass-bg': 'rgba(255, 255, 255, 0.08)',
        'glass-border': 'rgba(255, 255, 255, 0.15)',
        'text-primary': '#ffffff',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

