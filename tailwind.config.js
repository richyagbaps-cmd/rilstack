/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        pv: {
          green: "#0AB68B",
          "green-dark": "#078A6A",
          "green-light": "#E6F7F3",
          navy: "#0F2C3D",
          "navy-mid": "#1A4A5E",
          teal: "#0AD1C8",
          gold: "#F4A261",
        },
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        "slide-up": "slide-up 0.35s cubic-bezier(0.32,0.72,0,1)",
        "fade-in": "fade-in 0.25s ease",
        "pop-in": "pop-in 0.3s ease",
      },
    },
  },
  plugins: [],
};
