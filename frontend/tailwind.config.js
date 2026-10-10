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
        navy: {
          950: '#070b14',
          900: '#0c1322',
          850: '#111a2e',
          800: '#16223b',
          700: '#1e3054',
          600: '#2c4578',
        },
        electric: {
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
        },
        decision: {
          promote: '#10b981',
          block: '#ef4444',
          ignore: '#64748b',
          review: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
