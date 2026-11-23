/**
 * Per-theme stylesheet files. The default dark theme lives in the bundled
 * Layout CSS, so it has no entry here.
 */
export const THEME_STYLESHEETS = {
  light: 'light.css',
  'nord-light': 'light.css',
  'catppuccin-mocha': 'catppuccin-mocha.css',
  'catppuccin-macchiato': 'catppuccin-macchiato.css',
  'catppuccin-frappe': 'catppuccin-frappe.css',
  'catppuccin-latte': 'catppuccin-latte.css',
  'rose-pine': 'rose-pine.css',
  'rose-pine-moon': 'rose-pine-moon.css',
  'rose-pine-dawn': 'rose-pine-dawn.css',
};

/**
 * Theme id to stylesheet URL for the given base path. One builder, so the
 * pre-paint script and the runtime path cannot disagree on the URL.
 * @param {string} [base]
 */
export function themeStylesheetUrls(base = import.meta.env.BASE_URL || '/') {
  return Object.fromEntries(
    Object.entries(THEME_STYLESHEETS).map(([theme, file]) => [theme, `${base}themes/${file}`]),
  );
}

/**
 * Point the theme stylesheet link at the given theme, or clear it for the
 * bundled default. Each call queries the link element, so view-transition head
 * swaps stay working.
 * @param {string} theme
 * @param {Record<string, string>} [urls]
 */
export function applyThemeStylesheet(theme, urls = themeStylesheetUrls()) {
  const link = document.getElementById('theme-css');
  if (!link) return;

  const href = urls[theme];
  if (href) {
    link.setAttribute('href', href);
  } else {
    link.removeAttribute('href');
  }
}
