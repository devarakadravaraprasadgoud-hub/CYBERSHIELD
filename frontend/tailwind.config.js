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
        brand: {
          primary: '#6D28D9',
          hover: '#5B21B6',
          secondary: '#7C3AED',
          accent: '#8B5CF6',
          light: '#EDE9FE',
          veryLight: '#F5F3FF',
          border: '#DDD6FE',
        },
        surface: {
          app: '#F9FAFB',
          secondary: '#F5F3FF',
          card: '#FFFFFF',
          lavender: '#FAF8FF',
          selected: '#F3E8FF',
          disabled: '#F3F4F6',
        },
        content: {
          primary: '#1E1B4B',
          secondary: '#475569',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        accent: {
          blue: '#3B82F6',
          blueHover: '#2563EB',
          blueLight: '#EFF6FF',
          cyan: '#06B6D4',
        },
        borderSemantic: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
          purple: '#C4B5FD',
          softPurple: '#DDD6FE',
        },
        cyber: {
          dark: '#F9FAFB',
          navy: '#FFFFFF',
          slate: '#F5F3FF',
          card: '#FFFFFF',
          border: '#E5E7EB',
          cyan: '#6D28D9',
          accent: '#8B5CF6',
          neon: '#15803D',
          danger: '#B91C1C',
          warning: '#B45309'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'minimal': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(109, 40, 217, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(109, 40, 217, 0.08), 0 4px 6px -2px rgba(109, 40, 217, 0.04)',
        'purple-sm': '0 2px 8px rgba(109, 40, 217, 0.12)',
        'purple-md': '0 4px 16px rgba(109, 40, 217, 0.18)',
      }
    },
  },
  plugins: [],
}
