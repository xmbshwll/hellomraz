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

let cache: Map<string, RelatedPost[]> | null = null;

export async function getRelatedPosts(
  slug: string,
  limit = 4,
): Promise<RelatedPost[]> {
  if (!cache) {
    cache = new Map();
    const posts = await getPublishedPosts();
    const tagIndex = new Map<string, string[]>();

    for (const post of posts) {
      const postId = post.id;

      for (const tag of post.data.tags ?? []) {
        const normalizedTag = tag.toLowerCase();
        const postIds = tagIndex.get(normalizedTag) ?? [];
        postIds.push(postId);
        tagIndex.set(normalizedTag, postIds);
      }
    }

    const postMap = new Map(posts.map((post) => [post.id, post]));

    for (const post of posts) {
      const postId = post.id;
      const scores = new Map<string, number>();

      for (const tag of post.data.tags ?? []) {
        for (const relatedPostId of tagIndex.get(tag.toLowerCase()) ?? []) {
          if (relatedPostId === postId) continue;
          scores.set(relatedPostId, (scores.get(relatedPostId) ?? 0) + 1);
        }
      }

      const relatedPosts = [...scores.entries()]
        .sort((a, b) => {
          if (b[1] !== a[1]) return b[1] - a[1];

          const leftPost = postMap.get(a[0])!;
          const rightPost = postMap.get(b[0])!;
          return rightPost.data.pubDate.getTime() - leftPost.data.pubDate.getTime();
        })
        .slice(0, 8)
        .map(([relatedPostId]) => {
          const relatedPost = postMap.get(relatedPostId)!;

          return {
            slug: relatedPostId,
            title: relatedPost.data.title,
            tags: (relatedPost.data.tags ?? []).slice(0, 3),
            coverThumb: getCoverThumb(relatedPostId, 'sm'),
          };
        });

      cache.set(postId, relatedPosts);
    }
  }

  return (cache.get(slug) ?? []).slice(0, limit);
}

/**
 * Get the top shared tag name for a heading like "More hardcore"
 */
export function getTopSharedTag(
  currentTags: string[],
  relatedPosts: RelatedPost[],
): string {
  const currentTagSet = new Set(currentTags.map((tag) => tag.toLowerCase()));
  const counts = new Map<string, number>();

  for (const relatedPost of relatedPosts) {
    for (const tag of relatedPost.tags) {
      if (!currentTagSet.has(tag.toLowerCase())) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const topTag = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return topTag ?? currentTags[0] ?? 'similar';
}
