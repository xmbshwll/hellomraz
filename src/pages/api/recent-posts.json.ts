import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";
import { getBandcampData } from "../../lib/bandcamp";
import { getPostColor } from "../../lib/colors";

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("blog");
  const sorted = allPosts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const posts = await Promise.all(
    sorted.map(async (post) => {
      const bc = getBandcampData(post.slug);
      const color = getPostColor(post.slug);
      const initials = post.data.title
        .split(/[\s\-–—]+/)
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .join("");

      let thumbSrc: string | null = null;
      let coverSrc: string | null = null;
      if (bc?.coverUrl) {
        try {
          const [thumb, cover] = await Promise.all([
            getImage({ src: bc.coverUrl, width: 32, height: 32, format: "webp" }),
            getImage({ src: bc.coverUrl, width: 300, height: 300, format: "webp" }),
          ]);
          thumbSrc = thumb.src;
          coverSrc = cover.src;
        } catch {
          thumbSrc = bc.coverUrl;
          coverSrc = bc.coverUrl;
        }
      }

      return {
        slug: post.slug,
        title: post.data.title,
        tags: post.data.tags ?? [],
        year: post.data.pubDate.getFullYear(),
        date: post.data.pubDate.toISOString(),
        initials,
        coverUrl: thumbSrc,
        coverLg: coverSrc,
        colorDark: color.dark,
        colorAccent: color.accent,
      };
    })
  );

  return new Response(JSON.stringify(posts), {
    headers: { "Content-Type": "application/json" },
  });
};
