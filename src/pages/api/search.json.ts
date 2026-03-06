import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAlbum, parseArtistAlbum } from "../../lib/albums";

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("blog");
  const sorted = allPosts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const entries = sorted.map((post) => {
    const albumEntry = getAlbum(post.slug);
    const parsed = parseArtistAlbum(post.data.title);
    const artist = albumEntry?.artist?.trim() || parsed?.artist || "";
    const album = albumEntry?.album?.trim() || parsed?.album || post.data.title;

    return {
      slug: post.slug,
      title: post.data.title,
      artist,
      album,
    };
  });

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
};
