import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { getBandcampData } from '../../lib/bandcamp';
import { getPostColor } from '../../lib/colors';
import { getPublishedPosts } from '../../lib/blog-data.mjs';
import { getAlbumGeoSlug, getGeo, getPlaceLabel, getPlaceNames } from '../../lib/geo';
import type { GeoCardPayload } from '../../lib/geo';
import { HOME_REVIEW_INITIAL_POSTS } from '../../lib/feed-limits.mjs';
import { toReviewCardPost } from '../../lib/post-payloads.mjs';

/** Place of an album, ready for the card geo link. */
function geoFor(slug: string): GeoCardPayload | null {
  const geoSlug = getAlbumGeoSlug(slug);
  const place = getGeo(geoSlug);
  if (!geoSlug || !place) return null;
  return { name: getPlaceLabel(place), slug: geoSlug, names: getPlaceNames(place) };
}

export const GET: APIRoute = async () => {
  const publishedPosts = await getPublishedPosts();
  const remainingPosts = publishedPosts.slice(HOME_REVIEW_INITIAL_POSTS);
  const posts = await Promise.all(
    remainingPosts.map(async (post) => {
      const bandcamp = getBandcampData(post.id);
      const color = getPostColor(post.id);

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

      return toReviewCardPost(
        post,
        {
          coverLg,
          colorDark: color.dark,
          colorAccent: color.accent,
        },
        geoFor(post.id),
      );
    }),
  );

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
