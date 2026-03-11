import type { APIRoute, GetStaticPaths } from 'astro';
import {
  getLinkedTagNames,
  getPostsForTag,
} from '../../../lib/blog-data.mjs';
import { TAG_PAGE_POST_CAP } from '../../../lib/feed-limits.mjs';
import { toTagPost } from '../../../lib/post-payloads.mjs';
import { decodeTagParam, encodeTagParam } from '../../../lib/tag-path';

export const getStaticPaths = (async () => {
  return (await getLinkedTagNames()).flatMap((tag) => {
    const params = new Set([encodeTagParam(tag), encodeURIComponent(tag)]);
    return [...params].map((tagParam) => ({
      params: { tag: tagParam },
    }));
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const tag = decodeTagParam(params.tag ?? '');
  const posts = (await getPostsForTag(tag))
    .slice(TAG_PAGE_POST_CAP)
    .map(toTagPost);

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
