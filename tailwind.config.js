/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./popup/**/*.{js,ts,jsx,tsx}"],
  daisyui: {
    themes: ["cupcake"],
  },
  theme: {
    extend: {
      keyframes: {
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10%)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0%)",
          },
        },
        "fade-out-up": {
          "0%": {
            opacity: "1",
            transform: "translateY(0%)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-10%)",
          },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.25s ease-out",
        "fade-out-up": "fade-out-up 0.25s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
