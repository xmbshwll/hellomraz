/**
 * @typedef {import('./streaming').StreamingLink} StreamingLink
 */

/**
 * @param {string} bandcampAlbumId
 * @param {{ tracklist?: boolean; artwork?: 'default' | 'small' | 'none' }} [options]
 */
export function buildBandcampEmbedUrl(bandcampAlbumId, options = {}) {
  const { tracklist = false, artwork = 'default' } = options;

  const parts = [
    `https://bandcamp.com/EmbeddedPlayer/album=${bandcampAlbumId}`,
    'size=large',
    'bgcol=181818',
    'linkcol=22c55e',
  ];

  if (tracklist) {
    parts.push('tracklist=true');
  }

  if (artwork === 'small' || artwork === 'none') {
    parts.push(`artwork=${artwork}`);
  }

  parts.push('transparent=true');
  return `${parts.join('/')}/`;
}

/**
 * @param {StreamingLink[]} links
 * @param {string | null | undefined} bandcampAlbumId
 */
export function buildStreamingPlayers(links, bandcampAlbumId) {
  return (links ?? [])
    .map((link) => {
      if (link.service === 'Bandcamp' && bandcampAlbumId) {
        const embedUrl = buildBandcampEmbedUrl(bandcampAlbumId, {
          tracklist: true,
          artwork: 'none',
        });
        return {
          ...link,
          embedUrl,
        };
      }

      return link;
    })
    .filter((link) => link.embedUrl);
}

export const FLOATING_STREAMING_PLAYER_VIEWPORT_HEIGHT = 520;

const FLOATING_STREAMING_PLAYER_CONTENT_HEIGHTS = {
  Bandcamp: FLOATING_STREAMING_PLAYER_VIEWPORT_HEIGHT,
  Spotify: 960,
  'Apple Music': 840,
  Tidal: 720,
  Deezer: 900,
  'YouTube Music': 760,
  YouTube: 760,
  SoundCloud: 960,
  'Yandex Music': 820,
};

/**
 * @param {string} service
 */
export function getFloatingStreamingPlayerContentHeight(service) {
  return Math.max(
    FLOATING_STREAMING_PLAYER_VIEWPORT_HEIGHT,
    FLOATING_STREAMING_PLAYER_CONTENT_HEIGHTS[service] ??
      FLOATING_STREAMING_PLAYER_VIEWPORT_HEIGHT,
  );
}

/**
 * @param {string} service
 */
export function supportsFloatingTracklistScroll(service) {
  return (
    getFloatingStreamingPlayerContentHeight(service) >
    FLOATING_STREAMING_PLAYER_VIEWPORT_HEIGHT
  );
}

/**
 * @param {string} service
 * @param {'inline' | 'floating'} [mode]
 * @param {string} [chromeStyle]
 */
export function buildStreamingPlayerFrameStyle(
  service,
  mode = 'floating',
  chromeStyle = '',
) {
  const height =
    mode === 'floating'
      ? `${getFloatingStreamingPlayerContentHeight(service)}px`
      : '100%';
  const minHeight = mode === 'floating' ? height : '100%';

  return `border:0; width:100%; height:${height}; min-height:${minHeight}; display:block; ${chromeStyle}`;
}

/**
 * @param {Array<{ service: string }>} players
 */
export function getInitialStreamingPlayerIndex(players) {
  const bandcampIndex = (players ?? []).findIndex(
    (player) => player.service === 'Bandcamp',
  );
  return bandcampIndex >= 0 ? bandcampIndex : 0;
}

/**
 * @param {{ slug: string; index: number } | null | undefined} currentState
 * @param {{ slug: string; index: number }} request
 * @param {{ allowReplace?: boolean }} [options]
 * @returns {'activate' | 'reuse' | 'replace' | 'preserve'}
 */
export function resolveStreamingPlayerActivation(
  currentState,
  request,
  options = {},
) {
  if (!currentState) {
    return 'activate';
  }

  if (
    currentState.slug === request.slug &&
    currentState.index === request.index
  ) {
    return 'reuse';
  }

  if (currentState.slug === request.slug) {
    return 'replace';
  }

  return options.allowReplace ? 'replace' : 'preserve';
}

/**
 * @param {{ slug: string; mode: 'inline' | 'floating' } | null | undefined} currentState
 * @param {string} slug
 * @returns {'inactive' | 'inline' | 'floating' | 'blocked'}
 */
export function getStreamingPlayerUiState(currentState, slug) {
  if (!currentState) {
    return 'inactive';
  }

  if (currentState.slug !== slug) {
    return 'blocked';
  }

  return currentState.mode === 'floating' ? 'floating' : 'inline';
}

/**
 * @param {{ slug: string; mode: 'inline' | 'floating'; pinned?: boolean } | null | undefined} currentState
 * @param {string} slug
 */
export function shouldAutoRestoreStreamingPlayer(currentState, slug) {
  return !!currentState &&
    currentState.slug === slug &&
    currentState.mode === 'floating' &&
    !currentState.pinned;
}
