/**
 * Map marker payload: cities with albums, plus the populated states and
 * countries drawn as polygon targets. Shared by the map page stats and the
 * /api/geo-markers.json endpoint, so the payload leaves the HTML.
 */
import {
  getAllGeoPlaces,
  getGeo,
  getGeoCounts,
  getPlaceNameList,
  getPopulatedGeoSugs,
} from './geo';
import { projectToMap } from './geojson';

export interface GeoMarkerEntry {
  slug: string;
  type: string;
  x: number;
  y: number;
  count: number;
  href: string;
  region?: string;
  country?: string;
  names: { en: string; ru: string; de: string };
}

export interface GeoMarkerData {
  payload: GeoMarkerEntry[];
  cityCount: number;
  bandCount: number;
}

/** Built once per build: the place and album maps are static imports. */
let cache: GeoMarkerData | null = null;

export function buildGeoMarkers(): GeoMarkerData {
  if (cache) return cache;

  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const populated = new Set(getPopulatedGeoSugs());
  const geoPlaces = getAllGeoPlaces();
  const geoCounts = getGeoCounts();

  /** Clickable entry (dot or polygon target) for a geo slug. */
  function toEntry(slug: string): GeoMarkerEntry {
    const place = getGeo(slug) ?? { name: slug, lat: 0, lng: 0, cc: '', type: 'city' as const };
    const [x, y] = projectToMap([place.lng, place.lat]);
    return {
      slug,
      type: place.type,
      x,
      y,
      count: geoCounts.get(slug) ?? 0,
      href: `${base}geo/${slug}`,
      region: place.region,
      country: place.country,
      names: getPlaceNameList(place),
    };
  }

  // Only cities with albums get a dot, so seeded places stay out of the payload.
  // Regions (states) and countries are polygons.
  const markers = Object.keys(geoPlaces)
    .filter((slug) => geoPlaces[slug].type === 'city' && (geoCounts.get(slug) ?? 0) > 0)
    .map(toEntry);
  const states = [...populated].filter((slug) => getGeo(slug)?.type === 'state').map(toEntry);
  const countries = [...populated].filter((slug) => getGeo(slug)?.type === 'country').map(toEntry);

  cache = {
    payload: [...markers, ...states, ...countries],
    cityCount: markers.length,
    bandCount: countries.reduce((sum, country) => sum + country.count, 0),
  };
  return cache;
}
