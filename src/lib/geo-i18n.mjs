/** Language switching for geo place names (Russian, English, German). */
import { getCurrentSiteLang } from './site-i18n.mjs';

/** @typedef {{ en?: string; ru?: string; de?: string }} PlaceNames */

/**
 * Localised place name, English as the fallback.
 * @param {PlaceNames | undefined} names
 * @param {string} [lang]
 * @returns {string}
 */
export function pickPlaceName(names, lang = getCurrentSiteLang()) {
  if (!names) return '';
  return names[lang] || names.en || '';
}

/**
 * Rewrite every rendered place label for the current language.
 * @param {ParentNode} [root]
 */
export function applyPlaceNames(root = document) {
  const lang = getCurrentSiteLang();
  root.querySelectorAll('[data-geo-names]').forEach((element) => {
    const names = JSON.parse(element.dataset.geoNames || '{}');
    element.textContent = pickPlaceName(names, lang);
  });
}

/** Keep server-rendered place labels in sync with the language switcher. */
export function initPlaceNameSwitching() {
  applyPlaceNames();
  window.addEventListener('lang-changed', () => applyPlaceNames());
  document.addEventListener('astro:page-load', () => applyPlaceNames());
}
