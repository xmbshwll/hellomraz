/**
 * Escape a value for HTML text and attribute contexts.
 *
 * One copy, so a title renders the same on every page. The apostrophe is
 * escaped too, which keeps attribute values safe without changing what the
 * browser shows.
 */

/**
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}
