/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F2A47',
        'navy-light': '#173A5E',
        copper: '#C8A878',
        'off-white': '#F4F2EC',
        'border-light': '#E5E2D9',
        'border-lighter': '#EFEDE6',
        'text-primary': '#14181F',
        'text-secondary': '#5C6470',
        'text-muted': '#8A8F99',
        'sidebar-blue': '#173A5E',
        'status-green': '#1F7A4D',
        'status-green-bg': '#E3F2EA',
        'status-amber': '#B5781E',
        'status-amber-bg': '#FBF1E2',
        'status-red': '#A8362F',
        'status-red-bg': '#FBEDEB',
        'status-grey': '#5C6470',
        'status-grey-bg': '#EFEDE6',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        geist: ['Geist', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '10px',
        'input': '7px',
      },
      keyframes: {
        'bub-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'bub-spin': {
          'to': { transform: 'rotate(360deg)' },
        },
        'bub-fade': {
          'from': { opacity: '0', transform: 'translateY(4px)' },
          'to': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'bub-pulse': 'bub-pulse 1.5s ease-in-out infinite',
        'bub-spin': 'bub-spin 0.8s linear infinite',
        'bub-fade': 'bub-fade 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
