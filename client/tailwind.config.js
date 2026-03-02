/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#4F46E5",
        secondary: "#06B6D4",
        accent: "#10B981",
        danger: "#F43F5E",
        warning: "#F59E0B",
      },
      boxShadow: {
        premium: "0 20px 45px -24px rgba(15,23,42,0.35)",
        glass: "0 10px 24px rgba(15,23,42,0.1)",
      },
      keyframes: {
        floatBlob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(16px, -14px) scale(1.08)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-slow": "floatBlob 16s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.45s ease",
      },
    },
  },
  plugins: [],
};
