/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        accent: {
          500: '#a21caf',
          600: '#7c3aed'
        },
        background: '#f9fafb',
        foreground: '#111827',
        border: '#e5e7eb',
        card: '#fff',
        cardDark: '#18181b',
        meshFrom: '#38bdf8',
        meshTo: '#a21caf'
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans]
      },
      borderRadius: {
        card: '1.25rem',
        button: '0.75rem'
      },
      boxShadow: {
        card: '0 4px 32px 0 rgba(56,189,248,0.10), 0 1.5px 6px 0 rgba(162,28,175,0.08)',
        button: '0 2px 8px 0 rgba(56,189,248,0.10)'
      },
      backgroundImage: {
        'gradient-mesh': 'linear-gradient(120deg, #38bdf8 0%, #a21caf 100%)',
        'gradient-hero': 'linear-gradient(90deg, #38bdf8 0%, #7c3aed 100%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'zoom-in': 'zoomIn 0.4s cubic-bezier(0.4,0,0.2,1)',
        'wave': 'waveAnim 6s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        waveAnim: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        }
      }
    }
  },
  plugins: []
};

