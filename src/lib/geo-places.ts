/**
 * Canonical place registry — reads src/data/geo.geojson and exposes the
 * slug → place map. Kept in its own module so only registry consumers pull the
 * GeoJSON dataset.
 *
 * Geo entries form a country → region(state/province) → city hierarchy:
 * each entry carries its `country` slug, and cities in a state carry `region`
 * too (the state slug). Countries and states without a region use their own
 * slug as the parent.
 */
import geoCollection from '../data/geo.geojson';
import { indexFeatures, type PlaceCollection } from './geojson';

export type GeoType = 'city' | 'state' | 'country';

export interface GeoPlace {
  name: string;
  /** Localised names. English lives in `name`. */
  nameRu?: string;
  nameDe?: string;
  lat: number;
  lng: number;
  cc: string;
  type: GeoType;
  country?: string;
  region?: string;
}

const places = indexFeatures(geoCollection as PlaceCollection);

/** Place registry, keyed by geo slug, built from the GeoJSON collection. */
const geo: Record<string, GeoPlace> = Object.fromEntries(
  Object.entries(places).map(([slug, feature]) => {
    const [lng, lat] = feature.geometry.coordinates;
    const { name, nameRu, nameDe, type, cc, country, region } = feature.properties;
    return [slug, { name, nameRu, nameDe, lat, lng, cc, type: type as GeoType, country, region }];
  }),
);

/** Raw geo registry (slug → place). */
export function getAllGeoPlaces(): Record<string, GeoPlace> {
  return geo;
}

/** Every registered geo slug, including places with no albums yet. */
export function getAllGeoSugs(): string[] {
  return Object.keys(geo).sort((a, b) => geo[a].name.localeCompare(geo[b].name));
}

/** Canonical place definition for a geo slug, if known. */
export function getGeo(geoSlug?: string | null): GeoPlace | undefined {
  if (!geoSlug) return undefined;
  return geo[geoSlug];
}
