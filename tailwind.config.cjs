/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        context: "var(--context-color)",
        // Nord palette
        nord: {
          0: '#2E3440',
          1: '#3B4252',
          2: '#434C5E',
          3: '#4C566A',
          4: '#D8DEE9',
          5: '#E5E9F0',
          6: '#ECEFF4',
          7: '#8FBCBB',
          8: '#88C0D0',
          9: '#81A1C1',
          10: '#5E81AC',
          11: '#BF616A',
          12: '#D08770',
          13: '#EBCB8B',
          14: '#A3BE8C',
          15: '#B48EAD',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: '#D8DEE9',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            a: {
              color: '#88C0D0',
              '&:hover': { color: '#8FBCBB' },
              textDecoration: 'none',
            },
            'h1,h2,h3,h4,h5,h6': { color: '#ECEFF4' },
            strong: { color: '#ECEFF4' },
            code: {
              color: '#BF616A',
              backgroundColor: '#3B4252',
              borderRadius: '0',
              padding: `${theme('padding.1')} ${theme('padding[1.5]')}`,
              border: '1px solid #4C566A',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: '#2E3440',
              border: '1px solid #4C566A',
              borderRadius: '0',
            },
            blockquote: {
              color: '#D8DEE9',
              borderLeftColor: '#81A1C1',
            },
            hr: { borderColor: '#4C566A' },
            'ol > li::marker': { color: '#7b88a1' },
            'ul > li::marker': { color: '#7b88a1' },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
