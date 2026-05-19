/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          base: '#080b0f',
          surface: '#0e1318',
          card: '#121920',
          elevated: '#1a2430',
          hover: '#1f2d3d',
          border: 'rgba(255,255,255,0.07)',
        },
        neon: {
          DEFAULT: '#00ff88',
          dim: '#00cc6a',
        },
        muted: '#94a3b8',
        text: '#e2e8f0',
        danger: '#ff4d4d',
        warning: '#ffcc00',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0,255,136,0.2)',
        glow: '0 0 15px rgba(0,255,136,0.4)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'msg-in': 'msgIn 0.2s ease',
        blink: 'blink 1s step-end infinite',
        dots: 'dots 1.2s ease infinite',
        'spin-slow': 'spin 0.7s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        msgIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        dots: {
          '0%,80%,100%': { transform: 'scale(0.8)', opacity: 0.4 },
          '40%': { transform: 'scale(1.1)', opacity: 1 },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 10px rgba(0,255,136,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(0,255,136,0.5)' },
        },
      },
    },
  },
  plugins: [],
};