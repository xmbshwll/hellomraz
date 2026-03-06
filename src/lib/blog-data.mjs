import { getCollection } from 'astro:content';
import {
  buildDateIndex,
  buildTagCounts,
  sortPostsByDateDesc,
} from './blog-derived.mjs';

/** @typedef {import('astro:content').CollectionEntry<'blog'>} BlogPost */
/** @typedef {{ name: string; count: number }} QualifiedTag */
/** @typedef {{
 *   posts: BlogPost[];
 *   tagCounts: Map<string, number>;
 *   qualifiedTags: QualifiedTag[];
 *   postsByNormalizedTag: Map<string, BlogPost[]>;
 * }} BlogSnapshot */

/** @type {Promise<BlogSnapshot> | null} */
let snapshotPromise = null;

/** @type {Map<number, Record<string, number>>} */
const dateIndexCache = new Map();

/**
 * @returns {Promise<BlogSnapshot>}
 */
async function loadBlogSnapshot() {
  if (!snapshotPromise) {
    snapshotPromise = getCollection('blog', ({ data }) => !data.draft).then(
      (posts) => {
        const sortedPosts = sortPostsByDateDesc(posts);
        const tagCounts = buildTagCounts(sortedPosts);
        const postsByNormalizedTag = new Map();

        for (const post of sortedPosts) {
          for (const tag of post.data.tags ?? []) {
            const normalizedTag = tag.toLowerCase();
            const items = postsByNormalizedTag.get(normalizedTag) ?? [];
            items.push(post);
            postsByNormalizedTag.set(normalizedTag, items);
          }
        }

        const qualifiedTags = [...tagCounts.entries()]
          .filter(([, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([name, count]) => ({ name, count }));

        return {
          posts: sortedPosts,
          tagCounts,
          qualifiedTags,
          postsByNormalizedTag,
        };
      },
    );
  }

  return snapshotPromise;
}

/**
 * @returns {Promise<BlogPost[]>}
 */
export async function getPublishedPosts() {
  return (await loadBlogSnapshot()).posts;
}

/**
 * @returns {Promise<number>}
 */
export async function getPublishedPostCount() {
  return (await loadBlogSnapshot()).posts.length;
}

/**
 * @param {number} [limit=12]
 * @returns {Promise<BlogPost[]>}
 */
export async function getRecentPosts(limit = 12) {
  return (await getPublishedPosts()).slice(0, limit);
}

/**
 * @param {number} [pageSize=24]
 * @returns {Promise<Record<string, number>>}
 */
export async function getDateIndex(pageSize = 24) {
  if (!dateIndexCache.has(pageSize)) {
    dateIndexCache.set(pageSize, buildDateIndex(await getPublishedPosts(), pageSize));
  }

  return dateIndexCache.get(pageSize) ?? {};
}

/**
 * @param {number} [minCount=2]
 * @returns {Promise<QualifiedTag[]>}
 */
export async function getQualifiedTags(minCount = 2) {
  const snapshot = await loadBlogSnapshot();
  if (minCount === 2) return snapshot.qualifiedTags;

  return [...snapshot.tagCounts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

/**
 * @param {number} [minCount=2]
 * @returns {Promise<string[]>}
 */
export async function getLinkedTagNames(minCount = 2) {
  return (await getQualifiedTags(minCount)).map(({ name }) => name);
}

/**
 * @param {number} [minCount=2]
 * @returns {Promise<Set<string>>}
 */
export async function getLinkedTagSet(minCount = 2) {
  return new Set(await getLinkedTagNames(minCount));
}

/**
 * @returns {Promise<number>}
 */
export async function getTotalTagCount() {
  return (await loadBlogSnapshot()).tagCounts.size;
}

/**
 * @param {string} tag
 * @returns {Promise<BlogPost[]>}
 */
export async function getPostsForTag(tag) {
  const snapshot = await loadBlogSnapshot();
  return snapshot.postsByNormalizedTag.get(String(tag ?? '').toLowerCase()) ?? [];
}

/**
 * @param {number} [minCount=2]
 * @returns {Promise<Array<{ name: string; count: number; posts: BlogPost[] }>>}
 */
export async function getQualifiedTagPages(minCount = 2) {
  const [qualifiedTags, snapshot] = await Promise.all([
    getQualifiedTags(minCount),
    loadBlogSnapshot(),
  ]);

  return qualifiedTags.map(({ name, count }) => ({
    name,
    count,
    posts: snapshot.postsByNormalizedTag.get(name.toLowerCase()) ?? [],
  }));
}
