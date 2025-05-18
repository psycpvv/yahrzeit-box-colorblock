/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './sections/*.liquid',
    './snippets/*.liquid',
    './templates/*.liquid',
    './layout/*.liquid',
  ],
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8E9B7D',
          DEFAULT: '#0000FF',
          foreground: '#EFF2F6',
          text: '#0d0d0d',
        },
      },
      boxShadow: {
        checkbox: '0 0 0 1px #787878',
      },
    },
  },
  plugins: [],
}
