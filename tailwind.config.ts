/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E85D04",
          50:  "#FFF3EC",
          100: "#FFE0C7",
          200: "#FFBE8F",
          300: "#FF9548",
          400: "#FF7515",
          500: "#E85D04",
          600: "#C44D00",
          700: "#9A3C00",
          800: "#6E2A00",
          900: "#421900",
        },
        surface: {
          DEFAULT: "#0F0F11",
          card:    "#17171A",
          overlay: "#1E1E22",
          border:  "#2A2A30",
        },
      },
      fontFamily: {
        sans:    ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-bebas)", "sans-serif"],
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,93,4,0.18) 0%, transparent 70%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "fade-in":   "fadeIn 0.4s ease forwards",
        "shimmer":   "shimmer 2s linear infinite",
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer:  { from: { backgroundPosition: "-400px 0" }, to: { backgroundPosition: "400px 0" } },
        pulseDot: { "0%,100%": { transform: "scale(1)", opacity: 1 }, "50%": { transform: "scale(1.3)", opacity: 0.7 } },
      },
    },
  },
  plugins: [],
};
