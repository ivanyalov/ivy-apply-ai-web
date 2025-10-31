module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'notion-gray': {
          50: '#F7F6F3',
          100: '#F1F0ED',
          200: '#E3E2DF',
          300: '#C9C7C2',
          400: '#A8A29E',
          500: '#787268',
          600: '#605951',
          700: '#37352F',
        }
      }
    },
    fontFamily: {
     sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
     'dm-sans': ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
    }
  },
  plugins: [],
}
