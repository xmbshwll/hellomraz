/**
 * @typedef {{
 *   data: {
 *     pubDate: Date;
 *     tags?: string[];
 *   };
 * }} BlogLikePost
 */

/**
 * @template {BlogLikePost} T
 * @param {T[]} posts
 * @returns {T[]}
 */
export function sortPostsByDateDesc(posts) {
  return [...(posts ?? [])].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/**
 * @template {BlogLikePost} T
 * @param {T[]} posts
 * @returns {Map<string, number>}
 */
export function buildTagCounts(posts) {
  const tagCounts = new Map();

  for (const post of posts ?? []) {
    for (const tag of post.data.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return tagCounts;
}

/**
 * @template {BlogLikePost} T
 * @param {T[]} posts
 * @param {number} [pageSize=24]
 * @returns {Record<string, number>}
 */
export function buildDateIndex(posts, pageSize = 24) {
  const dateIndex = {};

  (posts ?? []).forEach((post, index) => {
    const date = post.data.pubDate;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!(key in dateIndex)) {
      dateIndex[key] = Math.floor(index / pageSize) + 1;
    }
  });

  return dateIndex;
}

/**
 * @template {BlogLikePost} T
 * @param {T[]} posts
 * @param {string} tag
 * @returns {T[]}
 */
export function filterPostsByTag(posts, tag) {
  const normalizedTag = String(tag ?? '').toLowerCase();
  if (!normalizedTag) return [];

  return (posts ?? []).filter((post) =>
    (post.data.tags ?? []).some(
      (value) => value.toLowerCase() === normalizedTag,
    ),
  );
}
