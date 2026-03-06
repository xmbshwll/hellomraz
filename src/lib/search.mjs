/**
 * @typedef {{
 *   slug: string;
 *   title: string;
 *   artist?: string;
 *   album?: string;
 * }} RawSearchEntry
 *
 * @typedef {RawSearchEntry & {
 *   order: number;
 *   titleSearch: string;
 *   artistSearch: string;
 *   albumSearch: string;
 *   searchText: string;
 * }} PreparedSearchEntry
 */

/**
 * Normalize text for simple client-side matching.
 * Keeps letters/numbers from any language, strips accents,
 * and smooths out a few stylized band-name symbols.
 *
 * @param {string | null | undefined} value
 */
export function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/\$/g, "s")
    .replace(/&/g, " ")
    .replace(/@/g, "a")
    .replace(/[’'`]/g, "")
    .replace(/[+]/g, " ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {RawSearchEntry[]} entries
 * @returns {PreparedSearchEntry[]}
 */
export function prepareSearchEntries(entries) {
  return (entries ?? []).map((entry, order) => {
    const title = String(entry.title ?? "").trim();
    const artist = String(entry.artist ?? "").trim();
    const album = String(entry.album ?? "").trim();

    return {
      ...entry,
      title,
      artist,
      album,
      order,
      titleSearch: normalizeSearchText(title),
      artistSearch: normalizeSearchText(artist),
      albumSearch: normalizeSearchText(album),
      searchText: normalizeSearchText(
        [artist, album, title].filter(Boolean).join(" "),
      ),
    };
  });
}

/**
 * @param {RawSearchEntry} entry
 * @returns {string}
 */
export function getSearchResultPrimaryLabel(entry) {
  const artist = String(entry?.artist ?? "").trim();
  const album = String(entry?.album ?? "").trim();
  const title = String(entry?.title ?? "").trim();

  if (artist && album) return `${artist} — ${album}`;
  return title;
}

/**
 * @param {RawSearchEntry} entry
 * @returns {string}
 */
export function getSearchResultSecondaryLabel(entry) {
  const title = String(entry?.title ?? "").trim();
  if (!title) return "";

  const primary = getSearchResultPrimaryLabel(entry);
  return normalizeSearchText(title) === normalizeSearchText(primary)
    ? ""
    : title;
}

/**
 * @param {string} text
 * @param {string} query
 */
function hasWordPrefix(text, query) {
  if (!text || !query) return false;
  return text.split(" ").some((word) => word.startsWith(query));
}

/**
 * @param {string} text
 * @param {string[]} tokens
 */
function hasAllTokens(text, tokens) {
  return tokens.every((token) => text.includes(token));
}

/**
 * Lower score = better match.
 *
 * @param {PreparedSearchEntry} entry
 * @param {string} query
 * @param {string[]} tokens
 * @returns {number | null}
 */
function getSearchScore(entry, query, tokens) {
  if (!query) return null;

  if (
    entry.artistSearch === query ||
    entry.albumSearch === query ||
    entry.titleSearch === query
  ) {
    return 0;
  }

  if (entry.artistSearch.startsWith(query)) return 1;
  if (entry.albumSearch.startsWith(query)) return 2;
  if (entry.titleSearch.startsWith(query)) return 3;

  if (hasWordPrefix(entry.artistSearch, query)) return 4;
  if (hasWordPrefix(entry.albumSearch, query)) return 5;
  if (hasWordPrefix(entry.titleSearch, query)) return 6;

  if (entry.artistSearch.includes(query)) return 7;
  if (entry.albumSearch.includes(query)) return 8;
  if (entry.titleSearch.includes(query)) return 9;

  if (tokens.length > 1 && hasAllTokens(entry.searchText, tokens)) return 10;

  return null;
}

/**
 * @param {PreparedSearchEntry[]} entries
 * @param {string} query
 * @param {number} [limit=8]
 * @returns {PreparedSearchEntry[]}
 */
export function searchEntries(entries, query, limit = 8) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return (entries ?? [])
    .map((entry) => ({
      entry,
      score: getSearchScore(entry, normalizedQuery, tokens),
    }))
    .filter((item) => item.score !== null)
    .sort((a, b) => {
      if (a.score !== b.score)
        return (
          /** @type {number} */ (a.score) - /** @type {number} */ (b.score)
        );
      return a.entry.order - b.entry.order;
    })
    .slice(0, limit)
    .map((item) => item.entry);
}
