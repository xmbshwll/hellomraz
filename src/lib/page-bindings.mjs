/**
 * Page-lifecycle binding guard for Astro view transitions.
 *
 * Each key runs its handler once per page load. Astro bundles component
 * scripts as external modules. It re-inserts them on navigation. The ES
 * module map caches by URL, so the module body runs once. This Set then
 * lives for the whole session.
 *
 * Clearing on astro:before-swap lets the next page load bind its own fresh
 * DOM. A bfcache restore fires no swap, so restored DOM keeps its bindings.
 */

/** Keys bound during the current page load. */
const boundKeys = new Set();

document.addEventListener('astro:before-swap', () => {
  boundKeys.clear();
});

/**
 * Run a handler once per key per page load.
 *
 * @param {string} key Stable key, one per init, for example 'geosearch:init'.
 * @param {() => void} handler Binding handler. It looks up its own elements.
 * @returns {boolean} True when the handler ran, false when already bound.
 */
export function bindOnce(key, handler) {
  if (boundKeys.has(key)) return false;
  boundKeys.add(key);
  handler();
  return true;
}
