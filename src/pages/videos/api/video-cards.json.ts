import type { APIRoute } from 'astro';
import { getAllVideos } from '../../../lib/videos';

export const GET: APIRoute = () => {
  const videos = getAllVideos();
  return new Response(JSON.stringify(videos), {
    headers: { 'Content-Type': 'application/json' },
  });
};
