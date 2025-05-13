/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-1px, 1px)' },
          '40%': { transform: 'translate(-1px, -1px)' },
          '60%': { transform: 'translate(1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
      animation: {
        shake: 'shake 0.3s linear infinite both',
      },
      backgroundImage:{
        radial:'radial-gradient(var(--tw-gradient-stops))',
        'radial-text': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
   
    },
  },
  plugins: [],
}

