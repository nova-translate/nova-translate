/**
 * @type {import('postcss').ProcessOptions}
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    '@thedutchcoder/postcss-rem-to-px': {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
}
