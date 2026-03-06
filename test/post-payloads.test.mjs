import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getTitleInitials,
  toReviewCardPost,
  toSidebarPost,
  toTagPost,
} from '../src/lib/post-payloads.mjs';

const post = {
  slug: 'artist-album',
  data: {
    title: 'Artist - Album Name',
    pubDate: new Date('2026-03-06T00:00:00.000Z'),
    tags: ['hardcore', 'punk'],
  },
};

test('getTitleInitials uses the first two title tokens', () => {
  assert.equal(getTitleInitials(post.data.title), 'AA');
});

test('toSidebarPost returns only sidebar fields', () => {
  assert.deepEqual(toSidebarPost(post), {
    slug: 'artist-album',
    title: 'Artist - Album Name',
    year: 2026,
  });
});

test('toTagPost returns only tag-list fields', () => {
  assert.deepEqual(toTagPost(post), {
    slug: 'artist-album',
    title: 'Artist - Album Name',
    date: '2026-03-06T00:00:00.000Z',
  });
});

test('toReviewCardPost returns only review-card fields', () => {
  assert.deepEqual(
    toReviewCardPost(post, {
      coverLg: '/cover.webp',
      colorDark: '#111111',
      colorAccent: '#eeeeee',
    }),
    {
      slug: 'artist-album',
      title: 'Artist - Album Name',
      tags: ['hardcore', 'punk'],
      initials: 'AA',
      coverLg: '/cover.webp',
      colorDark: '#111111',
      colorAccent: '#eeeeee',
    },
  );
});
