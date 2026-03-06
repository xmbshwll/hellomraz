import type { APIRoute } from 'astro';
import { getQualifiedTags } from '../../lib/blog-data.mjs';

export const GET: APIRoute = async () => {
  const tags = await getQualifiedTags();

  return new Response(JSON.stringify(tags), {
    headers: { 'Content-Type': 'application/json' },
  });
};
