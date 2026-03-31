/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        card: '#ffffff',
        border: '#e2e8f0',
        accent: {
          DEFAULT: '#4f46e5', // premium indigo
          secondary: '#3b82f6' // bright blue
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        primary: '#0f172a', // dark typography
        muted: '#64748b' // secondary typography
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 20px rgba(108, 99, 255, 0.25)'
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 20s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0) translateX(0)',
            opacity: '0.2'
          },
          '25%': { 
            transform: 'translateY(-20px) translateX(10px)',
            opacity: '0.4'
          },
          '50%': { 
            transform: 'translateY(-40px) translateX(-10px)',
            opacity: '0.6'
          },
          '75%': { 
            transform: 'translateY(-20px) translateX(5px)',
            opacity: '0.4'
          },
        }
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '200%': '200% auto',
      }
    },
  },
  plugins: [],
}
