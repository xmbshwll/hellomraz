import test from "node:test";
import assert from "node:assert/strict";

import {
  getSearchResultPrimaryLabel,
  getSearchResultSecondaryLabel,
  normalizeSearchText,
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
