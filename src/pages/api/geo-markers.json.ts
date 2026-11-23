import type { APIRoute } from 'astro';
import { buildGeoMarkers } from '../../lib/geo-markers';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildGeoMarkers().payload), {
    headers: { 'Content-Type': 'application/json' },
  });
