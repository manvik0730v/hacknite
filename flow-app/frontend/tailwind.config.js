export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sin: {
          bg: '#0a0a0a',
          accent: '#00ffcc',
          glow: '#ff00ff',
        }
      },
      fontFamily: {
        flow: ['"Orbitron"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}