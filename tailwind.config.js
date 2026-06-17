/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ecoflo: {
          DEFAULT: "#64A70B",
          50: "#f3f9e8",
          100: "#e3f0c8",
          600: "#5a960a",
          700: "#497a08",
        },
        navy: {
          DEFAULT: "#041E42",
          800: "#0a2c5a",
          700: "#0f3a72",
          600: "#16498c",
        },
        rag: {
          green: "#64A70B",
          amber: "#E0A106",
          red: "#D14343",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(4,30,66,0.04), 0 4px 16px rgba(4,30,66,0.06)",
        cardHover: "0 2px 6px rgba(4,30,66,0.08), 0 12px 28px rgba(4,30,66,0.10)",
      },
    },
  },
  plugins: [],
};
