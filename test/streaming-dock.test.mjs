import test from 'node:test';
import assert from 'node:assert/strict';

import {
  describeDockSession,
  reduceDockState,
  shouldRestoreInline,
} from '../src/lib/streaming-dock.mjs';

const basePayload = {
  slug: 'album-a',
  title: 'Artist A - Album A',
  service: 'Bandcamp',
  index: 0,
  embedUrl: 'https://bandcamp.com/EmbeddedPlayer/v=2/album=1/artwork=none/',
  coverUrl: 'https://f4.bcbits.com/img/a.jpg',
  chromeStyle: '',
};

const spotifyPayload = {
  ...basePayload,
  service: 'Spotify',
  index: 1,
  embedUrl: 'https://open.spotify.com/embed/album/1',
};

test('reduceDockState activates the first session inline', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });

  assert.equal(state.slug, 'album-a');
  assert.equal(state.mode, 'inline');
  assert.equal(state.pinned, false);
  assert.equal(state.expanded, false);
});

test('reduceDockState reuses the same embed for the active tab', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const next = reduceDockState(state, { type: 'activate', payload: basePayload });

  // Same embed and chrome style, so the dock keeps the one live iframe.
  assert.equal(next.embedUrl, state.embedUrl);
  assert.equal(next.chromeStyle, state.chromeStyle);
  assert.equal(next.index, state.index);
});

test('reduceDockState swaps the embed when the service changes on the same album', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const next = reduceDockState(state, { type: 'activate', payload: spotifyPayload });

  assert.notEqual(next.embedUrl, state.embedUrl);
  assert.equal(next.index, 1);
  assert.equal(next.service, 'Spotify');
});

test('reduceDockState keeps another album unless the caller allows a takeover', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const other = { ...basePayload, slug: 'album-b', title: 'Artist B - Album B' };

  assert.equal(reduceDockState(state, { type: 'activate', payload: other }), state);

  const replaced = reduceDockState(state, {
    type: 'activate',
    payload: { ...other, allowReplace: true },
  });
  assert.equal(replaced.slug, 'album-b');
});

test('reduceDockState brings a floating session inline when its tab is clicked', () => {
  const inline = reduceDockState(null, { type: 'activate', payload: basePayload });
  const floating = reduceDockState(inline, { type: 'show-floating', expand: true });
  const back = reduceDockState(floating, {
    type: 'activate',
    payload: { ...basePayload, mode: 'inline', allowReplace: true },
  });

  assert.equal(back.mode, 'inline');
  assert.equal(back.embedUrl, inline.embedUrl);
});

test('reduceDockState pins a floating session and keeps it pinned', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const floating = reduceDockState(state, {
    type: 'show-floating',
    expand: true,
    pinned: true,
  });

  assert.equal(floating.mode, 'floating');
  assert.equal(floating.pinned, true);
  assert.equal(floating.expanded, true);
});

test('reduceDockState collapses only expanded floating sessions', () => {
  const inline = reduceDockState(null, { type: 'activate', payload: basePayload });
  assert.equal(reduceDockState(inline, { type: 'toggle-expanded' }), inline);

  const floating = reduceDockState(inline, { type: 'show-floating', expand: true });
  const collapsed = reduceDockState(floating, { type: 'toggle-expanded', force: false });
  assert.equal(collapsed.expanded, false);
});

test('reduceDockState closes the session', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  assert.equal(reduceDockState(state, { type: 'close' }), null);
});

test('shouldRestoreInline restores only navigation-floating sessions', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const floating = reduceDockState(state, { type: 'show-floating', expand: true, pinned: false });

  assert.equal(shouldRestoreInline(floating), true);
  assert.equal(shouldRestoreInline({ ...floating, pinned: true }), false);
  assert.equal(shouldRestoreInline(state), false);
  assert.equal(shouldRestoreInline(null), false);
});

test('describeDockSession reports the inactive chrome', () => {
  const ui = describeDockSession(null, 'album-a');

  assert.equal(ui.uiState, 'inactive');
  assert.equal(ui.isFloating, false);
  assert.equal(ui.isPinned, false);
  assert.equal(ui.placeholderHidden, false);
  assert.equal(ui.noteHidden, true);
  assert.equal(ui.serviceText, '');
  assert.equal(ui.pinLabel, 'pin');
  assert.equal(ui.pinTitle, 'Pin player to floating widget');
  assert.equal(ui.pinAriaPressed, 'false');
  assert.equal(ui.stageMessage, 'Playback stays alive while you browse this site.');
});

test('describeDockSession reports the inline chrome', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const ui = describeDockSession(state, 'album-a');

  assert.equal(ui.uiState, 'inline');
  assert.equal(ui.isFloating, false);
  assert.equal(ui.placeholderHidden, true);
  assert.equal(ui.noteHidden, true);
});

test('describeDockSession reports the floating chrome', () => {
  const inline = reduceDockState(null, { type: 'activate', payload: basePayload });
  const floating = reduceDockState(inline, { type: 'show-floating', expand: true });
  const ui = describeDockSession(floating, 'album-a');

  assert.equal(ui.uiState, 'floating');
  assert.equal(ui.isFloating, true);
  assert.equal(ui.isPinned, false);
  assert.equal(ui.noteHidden, false);
  assert.equal(ui.noteTitle, 'playing in floating widget');
  assert.equal(ui.serviceText, 'Bandcamp \u00b7 use the widget controls to hide or close it');
  assert.equal(ui.pinLabel, 'pin');
  assert.equal(ui.pinAriaPressed, 'true');
});

test('describeDockSession reports the pinned wording', () => {
  const inline = reduceDockState(null, { type: 'activate', payload: basePayload });
  const pinned = reduceDockState(inline, { type: 'show-floating', expand: true, pinned: true });
  const ui = describeDockSession(pinned, 'album-a');

  assert.equal(ui.isPinned, true);
  assert.equal(ui.noteTitle, 'player pinned in widget');
  assert.equal(ui.pinLabel, 'pinned');
  assert.equal(ui.pinTitle, 'Player pinned in floating widget');
});

test('describeDockSession reports the blocked chrome', () => {
  const state = reduceDockState(null, { type: 'activate', payload: basePayload });
  const ui = describeDockSession(state, 'album-b');

  assert.equal(ui.uiState, 'blocked');
  assert.equal(ui.placeholderHidden, false);
  assert.equal(ui.noteHidden, true);
  assert.equal(
    ui.stageMessage,
    'Another album is already playing in the floating widget. Click any tab to switch here.',
  );
});
