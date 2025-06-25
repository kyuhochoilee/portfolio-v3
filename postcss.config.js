/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, //  ✅ NEW — the PostCSS plugin
    // autoprefixer is now optional in v4; keep it if you still need it:
    // 'autoprefixer': {},
  },
};
