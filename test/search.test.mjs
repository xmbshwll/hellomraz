import test from "node:test";
import assert from "node:assert/strict";

import {
  getPostSlugFromPath,
  getSearchResultPrimaryLabel,
  getSearchResultSecondaryLabel,
  normalizeSearchText,
  pickRandomEntry,
  prepareSearchEntries,
  searchEntries,
} from "../src/lib/search.mjs";

const entries = prepareSearchEntries([
  {
    slug: "turnstile-glow-on",
    title: "Turnstile - GLOW ON",
    artist: "Turnstile",
    album: "GLOW ON",
  },
  {
    slug: "angel-dust-brand-new-soul",
    title: "Angel Du$t - Brand New Soul",
    artist: "Angel Du$t",
    album: "Brand New Soul",
  },
  {
    slug: "drug-church-prude",
    title: "Drug Church - PRUDE",
    artist: "Drug Church",
    album: "PRUDE",
  },
  {
    slug: "church-girls-home",
    title: "Church Girls - Home",
    artist: "Church Girls",
    album: "Home",
  },
]);

test("normalizeSearchText handles accents, spacing, and stylized symbols", () => {
  assert.equal(normalizeSearchText("  Ángel   Du$t + Co.  "), "angel dust co");
});

test("searchEntries ranks artist prefix hits before looser matches", () => {
  const results = searchEntries(entries, "church");
  assert.deepEqual(
    results.slice(0, 2).map((entry) => entry.slug),
    ["church-girls-home", "drug-church-prude"],
  );
});

test("searchEntries matches stylized artist names and multi-token album queries", () => {
  assert.equal(
    searchEntries(entries, "angel dust")[0]?.slug,
    "angel-dust-brand-new-soul",
  );
  assert.equal(
    searchEntries(entries, "brand soul")[0]?.slug,
    "angel-dust-brand-new-soul",
  );
  assert.equal(searchEntries(entries, "glow on")[0]?.slug, "turnstile-glow-on");
});

test("searchEntries returns an empty array for blank queries", () => {
  assert.deepEqual(searchEntries(entries, "   "), []);
});

test("search result labels suppress duplicate title lines", () => {
  const entry = {
    slug: "turnstile-glow-on",
    title: "Turnstile - GLOW ON",
    artist: "Turnstile",
    album: "GLOW ON",
  };

  assert.equal(getSearchResultPrimaryLabel(entry), "Turnstile — GLOW ON");
  assert.equal(getSearchResultSecondaryLabel(entry), "");
});

test("search result labels keep distinct secondary text", () => {
  const entry = {
    slug: "turnstile-glow-on-deluxe",
    title: "Turnstile - GLOW ON [deluxe]",
    artist: "Turnstile",
    album: "GLOW ON",
  };

  assert.equal(
    getSearchResultSecondaryLabel(entry),
    "Turnstile - GLOW ON [deluxe]",
  );
});

test("pickRandomEntry never returns the excluded slug", () => {
  const excludeSlug = "drug-church-prude";

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const picked = pickRandomEntry(entries, { excludeSlug });
    assert.ok(picked, "expected a pick");
    assert.notEqual(picked.slug, excludeSlug);
  }
});

test("pickRandomEntry skips the excluded slug even when the index points at it", () => {
  // 0.5 lands on index 2 of all four entries — the excluded one — so this
  // pick would return it if the exclusion were not applied. Across the three
  // remaining candidates the same value lands on index 1, Angel Du$t.
  const picked = pickRandomEntry(entries, {
    excludeSlug: "drug-church-prude",
    random: () => 0.5,
  });

  assert.equal(picked?.slug, "angel-dust-brand-new-soul");
});

test("pickRandomEntry falls back to the excluded slug when it is the only entry", () => {
  const only = [{ slug: "drug-church-prude", title: "Drug Church - PRUDE" }];

  assert.equal(
    pickRandomEntry(only, { excludeSlug: "drug-church-prude" })?.slug,
    "drug-church-prude",
  );
});

test("getPostSlugFromPath reads the slug off a review URL", () => {
  assert.equal(getPostSlugFromPath("/blog/drug-church-prude"), "drug-church-prude");
  // Astro serves posts as directories, so the trailing slash has to survive.
  assert.equal(
    getPostSlugFromPath("/blog/drug-church-prude/"),
    "drug-church-prude",
  );
});

test("getPostSlugFromPath honors the deployed base path", () => {
  assert.equal(
    getPostSlugFromPath("/hellomraz/blog/drug-church-prude/", "/hellomraz/"),
    "drug-church-prude",
  );
  // Same base without the trailing slash the caller may have trimmed.
  assert.equal(
    getPostSlugFromPath("/hellomraz/blog/drug-church-prude", "/hellomraz"),
    "drug-church-prude",
  );
});

test("getPostSlugFromPath returns nothing outside review pages", () => {
  for (const path of ["/", "/blog", "/blog/", "/tags/punk", "/search"]) {
    assert.equal(getPostSlugFromPath(path), "", `expected no slug for ${path}`);
  }
  // A base mismatch must not be mistaken for a review either.
  assert.equal(getPostSlugFromPath("/blog/drug-church-prude", "/hellomraz/"), "");
});
