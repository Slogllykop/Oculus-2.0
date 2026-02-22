/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./toolbox.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bcfd",
          400: "#8196fa",
          500: "#6271f5",
          600: "#4f52eb",
          700: "#3f40d0",
          800: "#3436a8",
          900: "#2e3285",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
