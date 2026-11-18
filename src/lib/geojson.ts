/**
 * Minimal GeoJSON support (RFC 7946): the types this site needs plus the
 * equirectangular projection used by the world map.
 *
 * The projector is the only map assumption: the source polygons and points are
 * plain longitude/latitude, so any conforming GeoJSON viewer can read them.
 */
type Position = [number, number];

interface PointGeometry {
  type: 'Point';
  coordinates: Position;
}

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Position[][];
}

interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

type AreaGeometry = PolygonGeometry | MultiPolygonGeometry;

export interface Feature<Geometry, Properties> {
  type: 'Feature';
  /** Geo slug for places, otherwise the source identifier (ISO code, USPS code). */
  id: string;
  properties: Properties;
  geometry: Geometry;
}

export interface FeatureCollection<Geometry, Properties> {
  type: 'FeatureCollection';
  features: Array<Feature<Geometry, Properties>>;
}

/** Properties carried by a place in src/data/geo.geojson. */
interface PlaceProperties {
  name: string;
  /** Localised names; English lives in `name`. */
  nameRu?: string;
  nameDe?: string;
  type: string;
  cc: string;
  country?: string;
  region?: string;
  note?: string;
  aliases?: string[];
}

/** Properties carried by a country or region polygon. */
interface AreaProperties {
  name: string;
}

export type PlaceCollection = FeatureCollection<PointGeometry, PlaceProperties>;
export type AreaCollection = FeatureCollection<AreaGeometry, AreaProperties>;

/** World map size in SVG user units. The projection is 2:1 like the globe. */
export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 480;

/** Longitude/latitude to map user units. */
export function projectToMap([lng, lat]: Position): Position {
  return [((lng + 180) / 360) * MAP_WIDTH, ((90 - lat) / 180) * MAP_HEIGHT];
}

function ringToSubpath(ring: Position[]): string {
  const open =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;
  const segments = open.map((position, index) => {
    const [x, y] = projectToMap(position);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `${segments.join('')}Z`;
}

/** Flatten a Polygon or MultiPolygon into one SVG path string. */
export function areaToSvgPath(geometry: AreaGeometry): string {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flat().map(ringToSubpath).join('');
}

/** Every place in a collection, keyed by its feature id (the geo slug). */
export function indexFeatures<Geometry, Properties>(
  collection: FeatureCollection<Geometry, Properties>,
): Record<string, Feature<Geometry, Properties>> {
  return Object.fromEntries(collection.features.map((feature) => [feature.id, feature]));
}
