/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  safelist: [
    {
      pattern: /bg-ourArabGreen-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-ourArabGreen-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /ring-ourArabGreen-(400|500|600)/,
    }
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        ourArabGreen: {
          50: '#f2faf5',
          100: '#e5f5eb',
          200: '#c6e8d3',
          300: '#94d5ad',
          400: '#3FA66A', // Base brand color
          500: '#38945e',
          600: '#2e7a4d',
          700: '#25613f',
          800: '#1d4d32',
          900: '#153f29',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
      backgroundImage: {
        'arabesque-pattern': "url('/assets/arabesque-bg.svg')",
      },
    },
  },
  plugins: [
    require('tailwindcss-logical'), // Enables logical properties for RTL support
    require('@tailwindcss/typography'), // Useful for rich text styling
  ],
};

  
  


