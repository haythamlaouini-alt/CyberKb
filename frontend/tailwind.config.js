/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          base:     '#080b0f',
          surface:  '#0e1318',
          card:     '#121920',
          elevated: '#1a2430',
          hover:    '#1f2d3d',
          border:   'rgba(255,255,255,0.07)',
        },
        neon: {
          DEFAULT: '#00ff88',
          dim:     '#00cc6a',
        },
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        neon:  '0 0 20px rgba(0,255,136,0.2)',
        card:  '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'msg-in':  'msgIn 0.2s ease',
        'blink':   'blink 1s step-end infinite',
        'dots':    'dots 1.2s ease infinite',
        'spin-slow': 'spin 0.7s linear infinite',
      },
      keyframes: {
        msgIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        dots:  { '0%,80%,100%': { transform: 'scale(0.8)', opacity: 0.4 }, '40%': { transform: 'scale(1.1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
