/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Clash Display"', "system-ui", "sans-serif"],
        sans: ['"Satoshi"', '"General Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#def0ff",
          300: "#7cc7ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
      },
      keyframes: {
        "wag": {
          "0%, 100%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(22deg)" },
        },
        "blink": {
          "0%, 96%, 100%": { transform: "scaleY(1)" },
          "97%, 99%": { transform: "scaleY(0.1)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(45, 212, 191, 0.35)" },
          "50%": { boxShadow: "0 0 32px 6px rgba(45, 212, 191, 0.25)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        wag: "wag 0.6s ease-in-out infinite",
        blink: "blink 4s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1.8s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
      },
    },
  },
  plugins: [],
};
