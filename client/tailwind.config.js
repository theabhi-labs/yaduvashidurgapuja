/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F8F3EA', // Canonical warm cream background
          300: '#EFE7D8',
          400: '#E2D5BE',
          500: '#D1BE9E',
        },
        maroon: {
          50: '#FAF0F1',
          100: '#F5DCDD',
          200: '#EAB9BC',
          300: '#DB8D92',
          400: '#CA5E65',
          500: '#A8252F',
          600: '#8E1C25',
          700: '#7A1820', // Canonical primary maroon
          800: '#5F1218',
          900: '#460C11',
          950: '#2A0609',
        },
        gold: {
          50: '#FAF6EC',
          100: '#F4ECD0',
          200: '#E8D8A0',
          300: '#D9C06E',
          400: '#CAA94D',
          500: '#B88A3B', // Canonical muted gold
          600: '#9E722C',
          700: '#7E5821',
          800: '#61431B',
          900: '#463015',
        },
        dark: {
          50: '#F6F5F5',
          100: '#E7E5E5',
          200: '#CFCBCA',
          300: '#ABA5A3',
          400: '#837B78',
          500: '#625A57',
          600: '#4E4644',
          700: '#3D3634',
          800: '#2E2726',
          900: '#241414', // Canonical dark brown
          950: '#150B0B',
        },
        muted: {
          DEFAULT: '#756A62',
          light: '#938880',
          dark: '#564D47',
        }
      },
      fontFamily: {
        devanagariSerif: ['"Noto Serif Devanagari"', 'serif'],
        devanagariSans: ['"Noto Sans Devanagari"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif Devanagari"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(36, 20, 20, 0.05)',
        'medium': '0 8px 30px -4px rgba(36, 20, 20, 0.08)',
        'gold-glow': '0 0 25px -5px rgba(184, 138, 59, 0.25)',
        'maroon-glow': '0 0 25px -5px rgba(122, 24, 32, 0.2)',
      },
    },
  },
  plugins: [],
}
