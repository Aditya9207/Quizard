/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#F0F4FF',
          bgAlt: '#FAF0FF',
          surface: '#FFFFFF',
          text: '#1E1B4B',
          muted: '#64748B',
        },
        violet: {
          accent: '#7C3AED',
        },
        cyan: {
          accent: '#06B6D4',
        },
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.3), 0 0 30px rgba(6, 182, 212, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(124, 58, 237, 0.5), 0 0 50px rgba(6, 182, 212, 0.2)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'nudge-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'mesh-move': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) rotate(120deg) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg) scale(0.95)' },
        },
      },
      animation: {
        bob: 'bob 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        ripple: 'ripple 0.6s ease-out',
        'nudge-bounce': 'nudge-bounce 1.5s ease-in-out infinite',
        'mesh-move': 'mesh-move 20s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
