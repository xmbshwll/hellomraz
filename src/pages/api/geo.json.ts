import type { APIRoute } from 'astro';
import { getGeo, getGeoCounts, getPlaceNameList, getPopulatedGeoSugs } from '../../lib/geo';
import type { GeoSearchEntry } from '../../lib/geo';

export const GET: APIRoute = () => {
  const counts = getGeoCounts();
  const places = getPopulatedGeoSugs().map((slug): GeoSearchEntry => {
    const place = getGeo(slug);
    const isCountry = place?.type === 'country';
    return {
      slug,
      name: place?.name ?? slug,
      type: place?.type ?? 'city',
      count: counts.get(slug) ?? 0,
      countrySlug: isCountry ? '' : (place?.country ?? ''),
      regionSlug: place?.region ?? '',
      country: isCountry ? '' : (getGeo(place?.country)?.name ?? ''),
      names: getPlaceNameList(place),
    };
  });

  return new Response(JSON.stringify(places), {
    headers: { 'Content-Type': 'application/json' },
  });
};
