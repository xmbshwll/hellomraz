/**
 * Search result row content, shared by the header dropdown and the search
 * page.
 * Both callers keep an anchor wrapper and their own class names.
 * The builder takes the class names and returns DOM nodes, never an HTML
 * string.
 */
import {
  getSearchResultGeoLabel,
  getSearchResultPrimaryLabel,
  getSearchResultSecondaryLabel,
} from './search.mjs';

/**
 * @typedef {import('./search-index.mjs').PreparedSearchEntry} PreparedSearchEntry
 *
 * @typedef {{
 *   titleClass: string,
 *   secondaryClass?: string,
 *   geoClass?: string,
 * }} SearchRowClasses
 */

/**
 * Build one result row.
 * It holds the primary label, an optional secondary line, and an optional geo
 * line.
 * The geo line keeps the leading marker character.
 *
 * @param {PreparedSearchEntry} entry
 * @param {SearchRowClasses} classes
 * @returns {DocumentFragment}
 */
export function createSearchResultRow(entry, classes) {
  const fragment = document.createDocumentFragment();

  const title = document.createElement('span');
  title.className = classes.titleClass;
  title.textContent = getSearchResultPrimaryLabel(entry);
  fragment.appendChild(title);

  const secondary = getSearchResultSecondaryLabel(entry);
  if (secondary && classes.secondaryClass) {
    const meta = document.createElement('span');
    meta.className = classes.secondaryClass;
    meta.textContent = secondary;
    fragment.appendChild(meta);
  }

  const geoLabel = getSearchResultGeoLabel(entry);
  if (geoLabel && classes.geoClass) {
    const geo = document.createElement('span');
    geo.className = classes.geoClass;
    geo.textContent = `◉ ${geoLabel}`;
    fragment.appendChild(geo);
  }

  return fragment;
}
