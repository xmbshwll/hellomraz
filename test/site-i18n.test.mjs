import test from 'node:test';
import assert from 'node:assert/strict';

import { SITE_LANGS, getSiteCopy } from '../src/lib/site-i18n.mjs';

test('SITE_LANGS exposes the expected language options', () => {
  assert.deepEqual(
    SITE_LANGS.map((entry) => entry.id),
    ['ru', 'en', 'de'],
  );
});

test('getSiteCopy falls back to Russian for unknown languages', () => {
  assert.deepEqual(getSiteCopy('sidebarAbout', 'es'), getSiteCopy('sidebarAbout', 'ru'));
});

test('getSiteCopy returns centralized about page strings', () => {
  const aboutCopy = getSiteCopy('aboutPage', 'en');

  assert.equal(aboutCopy.about, '~ about');
  assert.match(aboutCopy.text, /Drop Your Weapon, Scum/);
  assert.equal(aboutCopy.links, '~ links');
});
