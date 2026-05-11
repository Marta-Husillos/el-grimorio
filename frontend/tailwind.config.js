/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#FDF1DC',
        dungeon: '#1a1a2e',
        'dungeon-mid': '#16213e',
        'dungeon-light': '#0f3460',
        dragon: '#7A1C1C',
        'dragon-light': '#9b2226',
        gold: '#C9A84C',
        'gold-light': '#e8c97a',
        'gold-dark': '#8B6914',
      },
      fontFamily: {
        cinzel: ["'Cinzel'", 'Georgia', 'serif'],
        baskerville: ["'Libre Baskerville'", 'Georgia', 'serif'],
      },
      backgroundImage: {
        'dungeon-texture':
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
