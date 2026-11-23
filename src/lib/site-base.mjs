/**
 * Site base path, read from the base-url meta tag that Layout renders.
 * One reader, so a change to the tag name or the fallback lands once.
 */

/**
 * @returns {string} Base path as Layout rendered it, with "/" as the fallback.
 */
export function getSiteBase() {
  const content = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
  return content || '/';
}
