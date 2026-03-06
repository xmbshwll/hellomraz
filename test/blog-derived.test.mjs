import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDateIndex,
  buildTagCounts,
  filterPostsByTag,
  sortPostsByDateDesc,
} from '../src/lib/blog-derived.mjs';

const posts = [
  {
    slug: 'march-a',
    data: {
      pubDate: new Date('2026-03-10T00:00:00Z'),
      tags: ['hardcore', 'punk'],
    },
  },
  {
    slug: 'march-b',
    data: {
      pubDate: new Date('2026-03-02T00:00:00Z'),
      tags: ['punk'],
    },
  },
  {
    slug: 'feb-a',
    data: {
      pubDate: new Date('2026-02-20T00:00:00Z'),
      tags: ['metal'],
    },
  },
  {
    slug: 'jan-a',
    data: {
      pubDate: new Date('2026-01-05T00:00:00Z'),
      tags: ['Hardcore'],
    },
  },
];

test('sortPostsByDateDesc orders newest first', () => {
  assert.deepEqual(sortPostsByDateDesc(posts).map((post) => post.slug), [
    'march-a',
    'march-b',
    'feb-a',
    'jan-a',
  ]);
});

test('buildTagCounts preserves exact tag keys and counts', () => {
  const counts = buildTagCounts(posts);

  assert.equal(counts.get('punk'), 2);
  assert.equal(counts.get('hardcore'), 1);
  assert.equal(counts.get('Hardcore'), 1);
});

test('buildDateIndex maps first month occurrence to paginated page', () => {
  const sorted = sortPostsByDateDesc(posts);

  assert.deepEqual(buildDateIndex(sorted, 2), {
    '2026-03': 1,
    '2026-02': 2,
    '2026-01': 2,
  });
});

test('filterPostsByTag matches tags case-insensitively', () => {
  assert.deepEqual(
    filterPostsByTag(posts, 'hardcore').map((post) => post.slug),
    ['march-a', 'jan-a'],
  );
});
