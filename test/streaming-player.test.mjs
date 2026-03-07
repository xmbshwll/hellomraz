import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBandcampEmbedUrl,
  buildStreamingPlayers,
  getInitialStreamingPlayerIndex,
  getStreamingPlayerUiState,
  resolveStreamingPlayerActivation,
  shouldAutoRestoreStreamingPlayer,
} from '../src/lib/streaming-player.mjs';

const links = [
  {
    service: 'Bandcamp',
    url: 'https://artist.bandcamp.com/album/release',
    embedUrl: null,
    icon: '⬡',
  },
  {
    service: 'Spotify',
    url: 'https://open.spotify.com/album/123',
    embedUrl: 'https://open.spotify.com/embed/album/123?theme=0',
    icon: '●',
  },
];

test('buildBandcampEmbedUrl can build artwork-free detached embeds', () => {
  const url = buildBandcampEmbedUrl('999', {
    tracklist: true,
    artwork: 'none',
  });

  assert.match(url, /album=999/);
  assert.match(url, /tracklist=true/);
  assert.match(url, /artwork=none/);
});

test('buildStreamingPlayers uses one artwork-free Bandcamp embed to preserve playback state', () => {
  const players = buildStreamingPlayers(links, '999');

  assert.equal(players[0]?.service, 'Bandcamp');
  assert.match(players[0]?.embedUrl || '', /album=999/);
  assert.match(players[0]?.embedUrl || '', /tracklist=true/);
  assert.match(players[0]?.embedUrl || '', /artwork=none/);
  assert.equal(players[1]?.service, 'Spotify');
});

test('buildStreamingPlayers filters out services without embed URLs', () => {
  const players = buildStreamingPlayers(links, null);

  assert.deepEqual(players.map((player) => player.service), ['Spotify']);
});

test('getInitialStreamingPlayerIndex prefers Bandcamp when present', () => {
  const players = buildStreamingPlayers(links, '999');
  assert.equal(getInitialStreamingPlayerIndex(players), 0);
});

test('getInitialStreamingPlayerIndex falls back to first available service', () => {
  const players = buildStreamingPlayers(links, null);
  assert.equal(getInitialStreamingPlayerIndex(players), 0);
});

test('resolveStreamingPlayerActivation preserves a different album during automatic hydration', () => {
  const action = resolveStreamingPlayerActivation(
    { slug: 'old-album', index: 0 },
    { slug: 'new-album', index: 0 },
  );

  assert.equal(action, 'preserve');
});

test('resolveStreamingPlayerActivation replaces the current iframe on manual takeover', () => {
  const action = resolveStreamingPlayerActivation(
    { slug: 'old-album', index: 0 },
    { slug: 'new-album', index: 0 },
    { allowReplace: true },
  );

  assert.equal(action, 'replace');
});

test('resolveStreamingPlayerActivation reuses the current iframe for the same slug and tab', () => {
  const action = resolveStreamingPlayerActivation(
    { slug: 'same-album', index: 1 },
    { slug: 'same-album', index: 1 },
  );

  assert.equal(action, 'reuse');
});

test('resolveStreamingPlayerActivation replaces the iframe when switching services on the same album', () => {
  const action = resolveStreamingPlayerActivation(
    { slug: 'same-album', index: 0 },
    { slug: 'same-album', index: 1 },
  );

  assert.equal(action, 'replace');
});

test('getStreamingPlayerUiState reflects ownership and floating state', () => {
  assert.equal(getStreamingPlayerUiState(null, 'album-a'), 'inactive');
  assert.equal(
    getStreamingPlayerUiState({ slug: 'album-a', mode: 'inline' }, 'album-a'),
    'inline',
  );
  assert.equal(
    getStreamingPlayerUiState({ slug: 'album-a', mode: 'floating' }, 'album-a'),
    'floating',
  );
  assert.equal(
    getStreamingPlayerUiState({ slug: 'album-b', mode: 'floating' }, 'album-a'),
    'blocked',
  );
});

test('shouldAutoRestoreStreamingPlayer only restores navigation-preserved sessions', () => {
  assert.equal(shouldAutoRestoreStreamingPlayer(null, 'album-a'), false);
  assert.equal(
    shouldAutoRestoreStreamingPlayer(
      { slug: 'album-a', mode: 'floating', pinned: false },
      'album-a',
    ),
    true,
  );
  assert.equal(
    shouldAutoRestoreStreamingPlayer(
      { slug: 'album-a', mode: 'floating', pinned: true },
      'album-a',
    ),
    false,
  );
  assert.equal(
    shouldAutoRestoreStreamingPlayer(
      { slug: 'album-b', mode: 'floating', pinned: false },
      'album-a',
    ),
    false,
  );
});
