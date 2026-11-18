/**
 * Inline SVG icons shared by server templates and client-rendered markup.
 * Both paths need the same string, so the icon lives here instead of being
 * repeated in .astro templates and JS template literals.
 */

/** Globe used for geo places (cards, post meta). */
export function globeIcon(size = 13): string {
  return (
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"` +
    ` width="${size}" height="${size}" aria-hidden="true" focusable="false">` +
    `<circle cx="12" cy="12" r="9"></circle>` +
    `<path d="M3 12h18"></path>` +
    `<ellipse cx="12" cy="12" rx="4.5" ry="9"></ellipse>` +
    `</svg>`
  );
}
