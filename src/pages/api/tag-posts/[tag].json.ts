import type { APIRoute, GetStaticPaths } from 'astro';
import { getLinkedTagNames, getPostsForTag } from '../../../lib/blog-data.mjs';
import { TAG_PAGE_POST_CAP } from '../../../lib/feed-limits.mjs';
import { toTagPost } from '../../../lib/post-payloads.mjs';
import { decodeTagParam, encodeTagParam } from '../../../lib/tag-path';
import { getCoverThumb } from '../../../lib/albums';

export const getStaticPaths = (async () => {
  return (await getLinkedTagNames()).map((tag) => ({
    params: { tag: encodeTagParam(tag) },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const tag = decodeTagParam(params.tag ?? '');
  const posts = (await getPostsForTag(tag)).slice(TAG_PAGE_POST_CAP).map((post) => ({
    ...toTagPost(post),
    coverThumb: getCoverThumb(post.id, 'sm'),
  }));

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
