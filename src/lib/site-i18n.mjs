/** @typedef {'ru' | 'en' | 'de'} SiteLang */

/** @type {{ id: SiteLang; label: string }[]} */
export const SITE_LANGS = [
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
];

const SITE_COPY = {
  sidebarAbout: {
    ru: {
      text: 'Лучшее музыкально-критическое СМИ в этой вселенной (возможно, после The Quietus).',
      link: 'ПО ЕБАЛУ →',
    },
    en: {
      text: 'The best music critical media outlet in this universe (possibly after The Quietus).',
      link: 'read more →',
    },
    de: {
      text: 'Das beste musikkritische Medium im ganzen Universum (möglicherweise nach The Quietus).',
      link: 'mehr erfahren →',
    },
  },
  aboutPage: {
    ru: {
      about: '~ about',
      paragraphs: [
        'Опусти Оружие, Мразь — самое лучшее во вселенной музыкально-критическое СМИ (возможно, после The Quietus).',
        'Быстрый DIY авторский блог в фристайл режиме. Жалобы не принимаются, восхищение музыкальным вкусом — напротив.',
        'С любовью, ПО ЕБАЛУ, из Берлина.',
      ],
      links: '~ links',
      blogLinks: 'blog related',
      authorLinks: 'personal (author)',
      support: '~ support',
    },
    en: {
      about: '~ about',
      paragraphs: [
        'Опусти Оружие, Мразь (Drop Your Weapon, Scum) — the best music criticism outlet in the universe (possibly after The Quietus).',
        'A fast DIY freestyle blog. Complaints are not accepted; admiration for the musical taste, on the other hand, is welcome.',
        'With love, ПО ЕБАЛУ (PUNCH IN THE FACE), from Berlin.',
      ],
      links: '~ links',
      blogLinks: 'blog related',
      authorLinks: 'personal (author)',
      support: '~ support',
    },
    de: {
      about: '~ about',
      paragraphs: [
        'Опусти Оружие, Мразь (Leg die Waffe nieder, Mistkerl) — das beste Musikkritik-Medium im Universum (möglicherweise nach The Quietus).',
        'Ein schneller DIY-Freestyle-Blog. Beschwerden werden nicht angenommen; Bewunderung für den Musikgeschmack hingegen schon.',
        'Mit Liebe, ПО ЕБАЛУ (INS GESICHT PUNCHEN), aus Berlin.',
      ],
      links: '~ links',
      blogLinks: 'blog related',
      authorLinks: 'personal (author)',
      support: '~ support',
    },
  },
};

/**
 * @template {keyof typeof SITE_COPY} T
 * @param {T} section
 * @param {SiteLang | string} [lang='ru']
 * @returns {(typeof SITE_COPY)[T]['ru']}
 */
export function getSiteCopy(section, lang = 'ru') {
  const sectionCopy = SITE_COPY[section];
  if (!sectionCopy) {
    throw new Error(`Unknown site copy section: ${section}`);
  }

  return sectionCopy[lang] ?? sectionCopy.ru;
}

/**
 * @returns {SiteLang}
 */
export function getCurrentSiteLang() {
  const lang = localStorage.getItem('site-lang');
  return SITE_LANGS.some((entry) => entry.id === lang) ? lang : 'ru';
}

/**
 * @param {SiteLang} lang
 */
export function setCurrentSiteLang(lang) {
  localStorage.setItem('site-lang', lang);
  window.dispatchEvent(new CustomEvent('lang-changed', { detail: lang }));
}
