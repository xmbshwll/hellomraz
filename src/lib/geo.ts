/**
 * Geographic association helpers — links the canonical places in
 * geo-places.ts to albums via albums.json `geo`.
 */
import albums from './albums';
import { getAllGeoPlaces, getAllGeoSugs, getGeo, type GeoPlace, type GeoType } from './geo-places';
import {
  byLanguage,
  geoNameAttr,
  getPlaceName,
  getPlaceNameList,
  type PlaceNameList,
  type SiteLang,
} from './geo-names';
import { joinPlaceLabel } from './place-label.mjs';

export { getAllGeoPlaces, getAllGeoSugs, getGeo, type GeoPlace, type GeoType };
export { getPlaceNameList };

/** One row of the geo search payload served by src/pages/api/geo.json.ts. */
export interface GeoSearchEntry {
  slug: string;
  name: string;
  type: string;
  count: number;
  /** Country slug, empty for a country itself. */
  countrySlug: string;
  /** Region (state/province) slug, empty when the place has no region. */
  regionSlug: string;
  /** Country name, shown under cities and regions. */
  country: string;
  /** Localised names, English included. */
  names: PlaceNameList;
}

/** Geo part of a review card payload (see src/pages/api/review-cards.json.ts). */
export interface GeoCardPayload {
  name: string;
  slug: string;
  names: PlaceNameList;
}

/**
 * Display label for a place. Cities carry their country, so the label reads
 * "Berlin, Germany" ("Берлин, Германия" in Russian). City-states repeat their
 * own name and stay bare.
 */
export function getPlaceLabel(place?: GeoPlace | null, lang: SiteLang = 'en'): string {
  if (!place) return '';
  const name = getPlaceName(place, lang);
  if (place.type !== 'city') return name;
  return joinPlaceLabel(name, getPlaceName(getGeo(place.country), lang));
}

/** Label per language, for the client-side language switcher. */
export function getPlaceNames(place?: GeoPlace | null): PlaceNameList {
  return byLanguage(place, getPlaceLabel);
}

/** Same attribute value, straight from a place. */
export function placeNameAttr(place?: GeoPlace | null): string {
  return geoNameAttr(getPlaceNames(place));
}

/** Geo slug assigned to an album (albums.json `geo`), if any. */
export function getAlbumGeoSlug(slug: string): string | undefined {
  const entry = albums[slug];
  return entry && typeof entry.geo === 'string' ? entry.geo : undefined;
}

/**
 * Region parent of a place: its state/province when it has one, otherwise
 * its country, otherwise itself.
 */
function getRegionSlug(place: GeoPlace | undefined): string | undefined {
  if (!place) return undefined;
  if (place.region) return place.region;
  return place.country;
}

/** Country parent of a place (itself when it is a country). */
function getCountrySlug(place: GeoPlace | undefined): string | undefined {
  if (!place) return undefined;
  if (place.type === 'country') return place.country ?? '';
  return place.country;
}

/**
 * Ancestry of a place from top-level country down: [country, region?].
 * The place slug itself is excluded.
 */
export function getGeoAncestors(geoSlug?: string | null): string[] {
  const place = getGeo(geoSlug);
  if (!place) return [];
  const country = getCountrySlug(place);
  const region = getRegionSlug(place);
  const chain = [country, region].filter(
    (slug, index, arr) => slug && slug !== geoSlug && arr.indexOf(slug) === index,
  ) as string[];
  return chain.reverse();
}

export interface GeoAlbumPost {
  slug: string;
  title: string;
  artist: string;
  album: string;
}

type GeoPostGroups = Array<{ geoSlug: string; posts: GeoAlbumPost[] }>;

/** Built once: the album and place maps are static module imports. */
let geoPostGroups: GeoPostGroups | null = null;

/**
 * One post per album, grouped by its assigned geo slug. Ordered by slug for
 * stable output. Posts within a location are ordered by title.
 *
 * The result is cached and shared, so callers must treat it as read only.
 */
function getGeoPosts(): GeoPostGroups {
  if (geoPostGroups) return geoPostGroups;
  const byGeo = new Map<string, GeoAlbumPost[]>();

  for (const [slug, entry] of Object.entries(albums)) {
    const geoSlug = typeof entry.geo === 'string' ? entry.geo : undefined;
    if (!geoSlug || !getGeo(geoSlug)) continue;

    const title = entry.album && entry.artist ? `${entry.artist} — ${entry.album}` : slug;
    const post: GeoAlbumPost = {
      slug,
      title,
      artist: entry.artist || '',
      album: entry.album || '',
    };

    const list = byGeo.get(geoSlug) ?? [];
    list.push(post);
    byGeo.set(geoSlug, list);
  }

  geoPostGroups = [...byGeo.entries()]
    .map(([geoSlug, posts]) => ({
      geoSlug,
      posts: posts.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.geoSlug.localeCompare(b.geoSlug));
  return geoPostGroups;
}

/**
 * Set of slugs a location "covers": itself plus any region/country it rolls
 * up into. Used to decide whether an album belongs to a country / region /
 * city when grouping.
 */
function coveredSlugs(geoSlug: string): Set<string> {
  const place = getGeo(geoSlug);
  const set = new Set([geoSlug]);
  if (!place) return set;
  if (place.region) set.add(place.region);
  if (place.country) set.add(place.country);
  return set;
}

/**
 * All albums associated with a geo location, including descendants.
 *   - city   → albums tagged exactly with that city
 *   - state  → state-tagged albums + albums from its cities
 *   - country→ country-tagged albums + albums from its states/cities
 */
export function getAlbumsForGeo(querySlug: string): GeoAlbumPost[] {
  const posts = getGeoPosts();
  const result = new Map<string, GeoAlbumPost>();

  for (const group of posts) {
    const set = coveredSlugs(group.geoSlug);
    if (set.has(querySlug)) {
      for (const post of group.posts) result.set(post.slug, post);
    }
  }

  return [...result.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Album count per location, descendants included, in one pass over the groups.
 * Used by the header geo search, which needs counts for every entry at once.
 */
export function getGeoCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { geoSlug, posts } of getGeoPosts()) {
    for (const slug of coveredSlugs(geoSlug)) {
      counts.set(slug, (counts.get(slug) ?? 0) + posts.length);
    }
  }
  return counts;
}

/**
 * All geo slugs that have content once descendants are counted: every
 * city/state/country that covers at least one tagged album. Used to generate
 * the /geo listings.
 */
export function getPopulatedGeoSugs(): string[] {
  return [...getGeoCounts().keys()].sort((a, b) =>
    (getGeo(a)?.name ?? a).localeCompare(getGeo(b)?.name ?? b),
  );
}
