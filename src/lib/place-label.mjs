/**
 * "City, Country" label rule, shared by the server helpers and the map client
 * so the suffix cannot be built two different ways.
 *
 * @param {string} name
 * @param {string} [countryName]
 * @returns {string}
 */
export function joinPlaceLabel(name, countryName = '') {
  if (!countryName || countryName === name) return name;
  return `${name}, ${countryName}`;
}
