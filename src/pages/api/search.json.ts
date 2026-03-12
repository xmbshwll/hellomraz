import type { APIRoute } from 'astro';
import { getAlbum, parseArtistAlbum } from '../../lib/albums';
import { getPublishedPosts } from '../../lib/blog-data.mjs';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const entries = posts.map((post) => {
    const albumEntry = getAlbum(post.id);
    const parsed = parseArtistAlbum(post.data.title);
    const artist = albumEntry?.artist?.trim() || parsed?.artist || '';
    const album = albumEntry?.album?.trim() || parsed?.album || post.data.title;

    return {
      slug: post.id,
      title: post.data.title,
      artist,
      album,
    };
  });

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
