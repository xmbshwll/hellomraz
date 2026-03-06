/**
 * Related posts — precomputed tag-based index.
 * Builds the index ONCE and caches it for all 1,187 blog pages.
 */
import { getCoverThumb } from './albums';
import { getPublishedPosts } from './blog-data.mjs';

export interface RelatedPost {
  slug: string;
  title: string;
  tags: string[];
  coverThumb: string | undefined;
}

let _cache: Map<string, RelatedPost[]> | null = null;

export async function getRelatedPosts(
  slug: string,
  limit = 4
): Promise<RelatedPost[]> {
  if (!_cache) {
    _cache = new Map();
    const posts = await getPublishedPosts();

    // Build tag → post slugs index
    const tagIndex = new Map<string, string[]>();
    for (const p of posts) {
      for (const t of p.data.tags ?? []) {
        const lower = t.toLowerCase();
        if (!tagIndex.has(lower)) tagIndex.set(lower, []);
        tagIndex.get(lower)!.push(p.slug);
      }
    }

    // Build a lookup for post data
    const postMap = new Map(posts.map(p => [p.slug, p]));

    // For each post, score related posts by shared tag count
    for (const p of posts) {
      const scores = new Map<string, number>();
      for (const t of p.data.tags ?? []) {
        for (const other of tagIndex.get(t.toLowerCase()) ?? []) {
          if (other !== p.slug) {
            scores.set(other, (scores.get(other) ?? 0) + 1);
          }
        }
      }

      const related = [...scores.entries()]
        .sort((a, b) => {
          // Primary: more shared tags
          if (b[1] !== a[1]) return b[1] - a[1];
          // Secondary: newer first
          const pa = postMap.get(a[0])!;
          const pb = postMap.get(b[0])!;
          return pb.data.pubDate.getTime() - pa.data.pubDate.getTime();
        })
        .slice(0, 8)
        .map(([s]) => {
          const post = postMap.get(s)!;
          return {
            slug: s,
            title: post.data.title,
            tags: (post.data.tags ?? []).slice(0, 3),
            coverThumb: getCoverThumb(s, 'sm'),
          };
        });

      _cache.set(p.slug, related);
    }
  }

  return (_cache.get(slug) ?? []).slice(0, limit);
}

/**
 * Get the top shared tag name for a heading like "More hardcore"
 */
export function getTopSharedTag(
  currentTags: string[],
  relatedPosts: RelatedPost[]
): string {
  const currentSet = new Set(currentTags.map(t => t.toLowerCase()));
  const counts = new Map<string, number>();
  for (const p of relatedPosts) {
    for (const t of p.tags) {
      if (currentSet.has(t.toLowerCase())) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? currentTags[0] ?? 'similar';
}
