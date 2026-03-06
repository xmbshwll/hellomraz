import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../lib/blog-data.mjs';
import { SIDEBAR_INITIAL_POSTS } from '../../lib/feed-limits.mjs';
import { toSidebarPost } from '../../lib/post-payloads.mjs';

export const GET: APIRoute = async () => {
  const posts = (await getPublishedPosts())
    .slice(SIDEBAR_INITIAL_POSTS)
    .map(toSidebarPost);

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
