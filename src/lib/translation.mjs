/**
 * Shared translation service.
 * Applied to any element with .markdown-content that needs i18n.
 */
import { getCurrentSiteLang, setCurrentSiteLang, SITE_LANGS } from './site-i18n.mjs';
import { getSiteBase } from './site-base.mjs';

const FALLBACK_MESSAGES = {
  en: 'Translation not yet available — showing original Russian.',
  de: 'Übersetzung noch nicht verfügbar — Original auf Russisch.',
};

/**
 * Remove any existing fallback banner.
 */
function removeFallbackBanner() {
  document.getElementById('lang-fallback-banner')?.remove();
}

/**
 * Show a fallback banner when translation is missing.
 * @param {string} lang - 'en' | 'de'
 * @param {Record<string,string>} [customMessages] - optional per-caller overrides
 */
function showFallbackBanner(lang, customMessages = {}) {
  removeFallbackBanner();

  const content = document.querySelector('.markdown-content');
  if (!content) return;

  const banner = document.createElement('div');
  banner.id = 'lang-fallback-banner';
  banner.className = 'lang-fallback-banner';
  banner.textContent = customMessages[lang] || FALLBACK_MESSAGES[lang] || FALLBACK_MESSAGES.en;
  content.parentNode?.insertBefore(banner, content);
}

/**
 * Read the raw translation file for a slug.
 * For 'ru' it returns null before any fetch.
 * The Russian original lives in the markdown.
 *
 * @param {string} slug - Post slug or youtube id.
 * @param {'posts' | 'videos'} type - Translation subfolder.
 * @param {string} lang - One of 'en', 'de', or 'ru'.
 * @returns {Promise<string | null>} Raw file text. Null when missing.
 */
export async function loadTranslationText(slug, type, lang) {
  if (!slug || lang === 'ru') return null;
  try {
    const base = getSiteBase();
    const response = await fetch(`${base}i18n/${lang}/${type}/${slug}.txt`);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Apply a translation to a content element.
 * @param {HTMLElement} contentEl - element with .markdown-content
 * @param {string} slug - post slug or youtubeId
 * @param {object} [opts]
 * @param {'post' | 'video'} [opts.type] - translation subfolder (default: 'post')
 * @param {Record<string,string>} [opts.fallbackMessages] - per-caller fallback messages
 */
export async function applyTranslationToElement(contentEl, slug, opts = {}) {
  if (!contentEl || !slug) return;

  const lang = getCurrentSiteLang();

  // Russian = show original
  if (lang === 'ru') {
    const original = contentEl.getAttribute('data-original-html');
    if (original) contentEl.innerHTML = original;
    contentEl.classList.remove('is-translating');
    removeFallbackBanner();
    return;
  }

  // Save original HTML on first translation
  if (!contentEl.getAttribute('data-original-html')) {
    contentEl.setAttribute('data-original-html', contentEl.innerHTML);
  }

  contentEl.classList.add('is-translating');

  const markdown = await loadTranslationText(slug, opts.type || 'posts', lang);
  if (markdown === null) {
    showFallbackBanner(lang, opts.fallbackMessages);
  } else {
    contentEl.innerHTML = markdown
      .trim()
      .split(/\n\n+/)
      .filter((paragraph) => paragraph.trim())
      .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
      .join('\n');

    removeFallbackBanner();
  }

  contentEl.classList.remove('is-translating');
}

/**
 * Setup lang-changed event listener.
 * Call once per page load.
 */
export function setupTranslationListener(getSlug) {
  window.addEventListener('lang-changed', (e) => {
    const contentEl = document.querySelector('.markdown-content');
    if (!contentEl) return;

    const slug =
      typeof getSlug === 'function'
        ? getSlug()
        : contentEl.closest('[data-post-slug]')?.getAttribute('data-post-slug');

    if (slug) applyTranslationToElement(contentEl, slug);
  });
}

export { getCurrentSiteLang, setCurrentSiteLang, SITE_LANGS };

/**
 * Fetch a per-slug translation file and parse "title\n\ndescription" format.
 * First non-empty line = title, everything after the first blank line = description.
 * Returns null if not found / fetch fails.
 *
 * @param {string} slug
 * @param {'posts' | 'videos'} type
 * @param {string} lang - 'en' | 'de' | 'ru'
 * @returns {Promise<{ title: string, description: string } | null>}
 */
export async function fetchTitledTranslation(slug, type, lang) {
  const raw = await loadTranslationText(slug, type, lang);
  if (raw === null) return null;
  const text = raw.trim();
  if (!text) return null;
  // Split on first blank line. Title = everything before, description = everything after.
  const parts = text.split(/\n\s*\n/);
  const title = (parts.shift() || '').trim();
  const description = parts.join('\n\n').trim();
  return { title, description };
}
