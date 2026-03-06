import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { getBandcampData } from '../../lib/bandcamp';
import { getPostColor } from '../../lib/colors';
import { getPublishedPosts } from '../../lib/blog-data.mjs';
import { HOME_REVIEW_INITIAL_POSTS } from '../../lib/feed-limits.mjs';
import { toReviewCardPost } from '../../lib/post-payloads.mjs';

export const GET: APIRoute = async () => {
  const posts = await Promise.all(
    (await getPublishedPosts()).slice(HOME_REVIEW_INITIAL_POSTS).map(async (post) => {
      const bandcamp = getBandcampData(post.slug);
      const color = getPostColor(post.slug);

      let coverLg = null;
      if (bandcamp?.coverUrl) {
        try {
          const cover = await getImage({
            src: bandcamp.coverUrl,
            width: 300,
            height: 300,
            format: 'webp',
          });
          coverLg = cover.src;
        } catch {
          coverLg = bandcamp.coverUrl;
        }
      }

      return toReviewCardPost(post, {
        coverLg,
        colorDark: color.dark,
        colorAccent: color.accent,
      });
    }),
  );

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
