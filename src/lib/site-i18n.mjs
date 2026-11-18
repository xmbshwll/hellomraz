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
  geoPicker: {
    ru: {
      placeholder: 'поиск города или страны…',
      rootLabel: 'все страны',
      footer: 'КАРТА →',
      empty: 'здесь пока пусто',
    },
    en: {
      placeholder: 'search city or country…',
      rootLabel: 'all countries',
      footer: 'GEO MAP →',
      empty: 'no places here yet',
    },
    de: {
      placeholder: 'Stadt oder Land suchen…',
      rootLabel: 'alle Länder',
      footer: 'KARTE →',
      empty: 'noch keine Orte hier',
    },
  },
  datePicker: {
    ru: { rootLabel: 'все годы', footer: 'все рецензии →' },
    en: { rootLabel: 'all years', footer: 'all reviews →' },
    de: { rootLabel: 'alle Jahre', footer: 'alle Rezensionen →' },
  },
  geoPage: {
    ru: {
      city: 'город',
      state: 'регион',
      country: 'страна',
      location: 'место',
      posts: { one: 'рецензия', few: 'рецензии', many: 'рецензий', other: 'рецензии' },
      empty: 'здесь пока нет рецензий — первая зажжёт это место на карте',
    },
    en: {
      city: 'city',
      state: 'region',
      country: 'country',
      location: 'location',
      posts: { one: 'post', few: 'posts', many: 'posts', other: 'posts' },
      empty: 'no reviews from here yet — the first one lights this place up on the map',
    },
    de: {
      city: 'Stadt',
      state: 'Region',
      country: 'Land',
      location: 'Ort',
      posts: { one: 'Rezension', few: 'Rezensionen', many: 'Rezensionen', other: 'Rezensionen' },
      empty: 'noch keine Rezensionen von hier — die erste erhellt diesen Ort auf der Karte',
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
