import type { APIRoute, GetStaticPaths } from 'astro';
import {
  getLinkedTagNames,
  getPostsForTag,
} from '../../../lib/blog-data.mjs';
import { TAG_PAGE_POST_CAP } from '../../../lib/feed-limits.mjs';
import { toTagPost } from '../../../lib/post-payloads.mjs';

export const getStaticPaths = (async () => {
  return (await getLinkedTagNames()).map((tag) => ({
    params: { tag: encodeURIComponent(tag) },
  }));
}) satisfies GetStaticPaths;

function decodeTagParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const GET: APIRoute = async ({ params }) => {
  const tag = decodeTagParam(params.tag ?? '');
  const posts = (await getPostsForTag(tag))
    .slice(TAG_PAGE_POST_CAP)
    .map(toTagPost);

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
