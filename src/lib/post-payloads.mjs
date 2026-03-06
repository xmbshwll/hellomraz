/** @typedef {import('astro:content').CollectionEntry<'blog'>} BlogPost */

/**
 * @param {string} title
 * @returns {string}
 */
export function getTitleInitials(title) {
  return String(title ?? '')
    .split(/[\s\-–—]+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * @param {BlogPost} post
 */
export function toSidebarPost(post) {
  return {
    slug: post.slug,
    title: post.data.title,
    year: post.data.pubDate.getFullYear(),
  };
}

/**
 * @param {BlogPost} post
 */
export function toTagPost(post) {
  return {
    slug: post.slug,
    title: post.data.title,
    date: post.data.pubDate.toISOString(),
  };
}

/**
 * @param {BlogPost} post
 * @param {{ coverLg: string | null; colorDark: string; colorAccent: string }} media
 */
export function toReviewCardPost(post, media) {
  return {
    slug: post.slug,
    title: post.data.title,
    tags: post.data.tags ?? [],
    initials: getTitleInitials(post.data.title),
    coverLg: media.coverLg,
    colorDark: media.colorDark,
    colorAccent: media.colorAccent,
  };
}
