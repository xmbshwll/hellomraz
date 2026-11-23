import assert from 'node:assert/strict';
import { test } from 'node:test';
import { escapeHtml } from '../src/lib/escape-html.mjs';

test('escapeHtml covers the HTML metacharacters', () => {
  assert.equal(escapeHtml(`& < > " '`), '&amp; &lt; &gt; &quot; &#39;');
});

test('escapeHtml leaves ordinary text alone', () => {
  assert.equal(escapeHtml('Arab Strap - Half-Told Tales'), 'Arab Strap - Half-Told Tales');
});

test('escapeHtml escapes each character only once', () => {
  assert.equal(escapeHtml('a&b'), 'a&amp;b');
  assert.equal(escapeHtml('&amp;'), '&amp;amp;');
});

test('escapeHtml handles a missing value', () => {
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(null), '');
});
