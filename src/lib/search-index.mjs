/**
 * Shared client-side search index loader: one fetch of api/search.json per
 * page load, then reused by the header dropdown and the search page.
 *
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   artist?: string,
 *   album?: string,
 *   geo?: string,
 * }} RawSearchEntry
 *
 * @typedef {RawSearchEntry & {
 *   order: number,
 *   titleSearch: string,
 *   artistSearch: string,
 *   albumSearch: string,
 *   geoSearch: string,
 *   searchText: string,
 * }} PreparedSearchEntry
 */
import { prepareSearchEntries } from './search.mjs';

/** @type {Promise<PreparedSearchEntry[]> | null} */
let indexPromise = null;

/**
 * Fetch and prepare the search index. The promise is cached, so the network
 * runs once per page load. The promise rejects when the request or parse fails.
 *
 * @param {string} base Site base path, e.g. "/".
 * @returns {Promise<PreparedSearchEntry[]>}
 */
export function loadSearchIndex(base) {
  if (!indexPromise) {
    indexPromise = fetch(`${base}api/search.json`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load search index');
        }
        return prepareSearchEntries(await response.json());
      })
      .catch((error) => {
        // Drop the failed promise so the next call can retry.
        indexPromise = null;
        throw error;
      });
  }

  return indexPromise;
}
