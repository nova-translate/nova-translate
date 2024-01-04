const { nextui } = require("@nextui-org/react")

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  mode: "jit",
  content: [
    "./**/*.tsx",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()]
}
