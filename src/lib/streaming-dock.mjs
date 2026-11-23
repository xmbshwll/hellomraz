/**
 * Streaming dock state machine and DOM orchestration.
 *
 * reduceDockState holds the pure transitions, so node --test can exercise the
 * activation, reuse, pin, and restore rules with plain objects.
 * createStreamingDock adds the DOM side: the one live iframe, refresh, and the
 * inline position watch.
 */
import {
  getStreamingPlayerUiState,
  resolveStreamingPlayerActivation,
  shouldAutoRestoreStreamingPlayer,
} from './streaming-player.mjs';

/**
 * @typedef {'inline' | 'floating'} DockMode
 *
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   service: string,
 *   index: number,
 *   mode: DockMode,
 *   pinned: boolean,
 *   expanded: boolean,
 *   embedUrl: string,
 *   coverUrl?: string,
 *   chromeStyle: string,
 * }} StreamingPlayerDockState
 *
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   service: string,
 *   index: number,
 *   embedUrl: string,
 *   coverUrl?: string,
 *   chromeStyle: string,
 *   mode?: DockMode,
 *   allowReplace?: boolean,
 *   expand?: boolean,
 *   pinned?: boolean,
 * }} DockActivatePayload
 *
 * @typedef {{
 *   type: 'activate',
 *   payload: DockActivatePayload,
 *
 * } | {
 *   type: 'close',
 *
 * } | {
 *   type: 'show-inline',
 *   slug?: string,
 *
 * } | {
 *   type: 'show-floating',
 *   expand?: boolean,
 *   pinned?: boolean,
 *
 * } | {
 *   type: 'toggle-expanded',
 *   force?: boolean,
 * }} DockEvent
 *
 * @typedef {{
 *   activate: (payload: DockActivatePayload) => boolean,
 *
 *   close: () => void,
 *
 *   showInline: (slug?: string) => boolean,
 *
 *   showFloating: (options?: { expand?: boolean, pinned?: boolean }) => boolean,
 *
 *   toggleExpanded: (force?: boolean) => void,
 *
 *   refresh: () => void,
 *
 *   shouldRestoreInline: (slug?: string) => boolean,
 *
 *   getState: () => StreamingPlayerDockState | null,
 * }} StreamingPlayerDockApi
 *
 * @typedef {(
 *   state: StreamingPlayerDockState | null,
 *   iframe: HTMLIFrameElement | null,
 *   controller: { queueRefresh: () => void },
 * ) => void} StreamingDockRender
 *
 * @typedef {{
 *   getInlineAnchor: (slug: string) => HTMLElement | null,
 *
 *   getRoot: () => HTMLElement | null,
 *
 *   getCurrentPagePlayerSlug: () => string,
 *
 *   createIframe: (state: StreamingPlayerDockState) => HTMLIFrameElement,
 *
 *   normalizeUrl: (url: string) => string,
 *
 *   applyInlinePosition: (anchor: HTMLElement) => boolean,
 *
 *   clearInlinePosition: () => void,
 *
 *   render: StreamingDockRender,
 *
 *   onChange: () => void,
 *
 *   onInlineReset: (slug: string) => void,
 *
 *   requestFrame: (callback: () => void) => void,
 *
 *   now: () => number,
 * }} StreamingDockEnvironment
 */

/**
 * Mode after activation. An explicit mode wins. A known album keeps its current
 * mode and a new album starts inline.
 *
 * @param {StreamingPlayerDockState | null} state
 * @param {DockMode | undefined} nextMode
 * @param {string} slug
 * @returns {DockMode}
 */
function resolveNextMode(state, nextMode, slug) {
  if (nextMode) return nextMode;
  return state?.slug === slug ? state.mode : 'inline';
}

/**
 * Pinned and expanded flags after activation. Inline sessions stay unpinned and
 * collapsed. A known floating album keeps its current flag. A new floating album
 * starts pinned.
 *
 * @param {StreamingPlayerDockState | null} state
 * @param {DockMode} nextMode
 * @param {string} slug
 * @param {boolean | undefined} explicitValue
 * @param {boolean} currentValue
 * @returns {boolean}
 */
function resolveFloatingFlag(state, nextMode, slug, explicitValue, currentValue) {
  if (nextMode !== 'floating') return false;
  if (typeof explicitValue === 'boolean') return explicitValue;
  if (state?.slug === slug) return currentValue;
  return true;
}

/**
 * Pure dock reducer. It maps (state, event) to the next state. The same state
 * reference comes back when the event changes nothing, so callers detect a no-op
 * by identity.
 *
 * @param {StreamingPlayerDockState | null} state
 * @param {DockEvent} event
 * @returns {StreamingPlayerDockState | null}
 */
export function reduceDockState(state, event) {
  switch (event.type) {
    case 'activate': {
      const { payload } = event;
      const action = resolveStreamingPlayerActivation(
        state,
        { slug: payload.slug, index: payload.index },
        { allowReplace: payload.allowReplace },
      );
      if (action === 'preserve') return state;

      const mode = resolveNextMode(state, payload.mode, payload.slug);
      const pinned = resolveFloatingFlag(
        state,
        mode,
        payload.slug,
        payload.pinned,
        state?.pinned ?? false,
      );
      const expanded = resolveFloatingFlag(
        state,
        mode,
        payload.slug,
        payload.expand,
        state?.expanded ?? false,
      );

      return {
        slug: payload.slug,
        title: payload.title,
        service: payload.service,
        index: payload.index,
        mode,
        pinned,
        expanded,
        embedUrl: payload.embedUrl,
        coverUrl: payload.coverUrl,
        chromeStyle: payload.chromeStyle,
      };
    }
    case 'close':
      return null;
    case 'show-inline': {
      if (!state) return state;
      if (event.slug && state.slug !== event.slug) return state;
      if (state.mode === 'inline' && !state.pinned && !state.expanded) return state;
      return { ...state, mode: 'inline', pinned: false, expanded: false };
    }
    case 'show-floating': {
      if (!state) return state;
      const wasInline = state.mode === 'inline';
      const pinned = typeof event.pinned === 'boolean' ? event.pinned : state.pinned;
      const expanded =
        typeof event.expand === 'boolean' ? event.expand : wasInline ? true : state.expanded;
      return { ...state, mode: 'floating', pinned, expanded };
    }
    case 'toggle-expanded': {
      if (!state || state.mode !== 'floating') return state;
      const expanded = typeof event.force === 'boolean' ? event.force : !state.expanded;
      return { ...state, expanded };
    }
    default:
      return state;
  }
}

/**
 * True when the session floats only because of navigation, so the same page can
 * restore it inline. A manually pinned session stays floating.
 *
 * @param {StreamingPlayerDockState | null} state
 * @returns {boolean}
 */
export function shouldRestoreInline(state) {
  return shouldAutoRestoreStreamingPlayer(state, state?.slug ?? '');
}

/**
 * Chrome strings and visibility flags for the inline player.
 * The result derives only from the dock state, so the wording stays testable.
 *
 * @param {StreamingPlayerDockState | null} state
 * @param {string} slug
 * @returns {{
 *   uiState: 'inactive' | 'inline' | 'floating' | 'blocked',
 *   isFloating: boolean,
 *   isPinned: boolean,
 *   placeholderHidden: boolean,
 *   noteHidden: boolean,
 *   noteTitle: string,
 *   serviceText: string,
 *   pinLabel: string,
 *   pinTitle: string,
 *   pinAriaPressed: string,
 *   stageMessage: string,
 * }}
 */
export function describeDockSession(state, slug) {
  const uiState = getStreamingPlayerUiState(state, slug);
  const isFloating = uiState === 'floating';
  const isPinned = isFloating && !!state?.pinned;

  let pinTitle = 'Pin player to floating widget';
  if (isPinned) {
    pinTitle = 'Player pinned in floating widget';
  } else if (isFloating) {
    pinTitle = 'Pin this floating player so it stays in the widget';
  }

  return {
    uiState,
    isFloating,
    isPinned,
    placeholderHidden: uiState === 'inline',
    noteHidden: !isFloating,
    noteTitle: isPinned ? 'player pinned in widget' : 'playing in floating widget',
    serviceText: isFloating
      ? `${state?.service || 'Streaming service'} · use the widget controls to hide or close it`
      : '',
    pinLabel: isPinned ? 'pinned' : 'pin',
    pinTitle,
    pinAriaPressed: isFloating ? 'true' : 'false',
    stageMessage:
      uiState === 'blocked'
        ? 'Another album is already playing in the floating widget. Click any tab to switch here.'
        : 'Playback stays alive while you browse this site.',
  };
}

/**
 * The live dock api. FloatingPlayerDock sets this for the other scripts,
 * because Astro bundles each component script separately.
 *
 * @returns {StreamingPlayerDockApi | null}
 */
export function getStreamingDock() {
  return /** @type {any} */ (window).__streamingPlayerDock ?? null;
}

/**
 * DOM side of the dock. The environment supplies every DOM touch: element
 * lookups, iframe creation, styling, and rendering.
 *
 * @param {StreamingDockEnvironment} env
 * @returns {StreamingPlayerDockApi}
 */
export function createStreamingDock(env) {
  /** @type {StreamingPlayerDockState | null} */
  let state = null;
  /** @type {HTMLIFrameElement | null} */
  let activeIframe = null;
  let refreshQueued = false;
  let inlineWatchUntil = 0;

  const controller = {
    queueRefresh: () => queueRefresh(),
  };

  function snapshot() {
    return state ? JSON.stringify(state) : 'null';
  }

  function getState() {
    return state ? { ...state } : null;
  }

  function removeActiveIframe() {
    if (activeIframe) activeIframe.remove();
    activeIframe = null;
  }

  /** Keep the one live iframe. Reuse it when url and chrome style match. */
  function ensureActiveIframe(nextState) {
    const embedUrl = nextState?.embedUrl;
    if (!embedUrl) return;

    const chromeStyle = nextState.chromeStyle || '';
    const currentUrl = activeIframe ? env.normalizeUrl(activeIframe.src) : '';
    const nextUrl = env.normalizeUrl(embedUrl);
    const currentChromeStyle = activeIframe?.dataset.chromeStyle || '';

    if (activeIframe && currentUrl === nextUrl && currentChromeStyle === chromeStyle) return;

    removeActiveIframe();
    activeIframe = env.createIframe(nextState);
    activeIframe.dataset.chromeStyle = chromeStyle;
  }

  /** State pass: restore a navigation session inline, drop a dead inline one. */
  function syncState() {
    if (!state || !activeIframe) return;

    if (shouldRestoreInline(state) && env.getInlineAnchor(state.slug)) {
      state = reduceDockState(state, { type: 'show-inline', slug: state.slug });
    }

    if (state.mode === 'inline' && !env.getInlineAnchor(state.slug)) {
      removeActiveIframe();
      state = null;
    }
  }

  function refresh(emit = false) {
    const before = snapshot();
    syncState();
    env.render(state, activeIframe, controller);
    if (emit || snapshot() !== before) env.onChange();
  }

  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    env.requestFrame(() => {
      refreshQueued = false;
      refresh();
    });
  }

  function activate(payload) {
    const nextState = reduceDockState(state, { type: 'activate', payload });
    if (nextState === state) {
      refresh(false);
      return false;
    }

    ensureActiveIframe(nextState);
    state = nextState;
    refresh(true);
    return true;
  }

  function close() {
    const targetSlug = env.getCurrentPagePlayerSlug();
    removeActiveIframe();
    state = null;
    refresh(true);
    if (targetSlug) env.onInlineReset(targetSlug);
  }

  function showInline(slug = state?.slug) {
    if (!state || !activeIframe) return false;
    if (slug && state.slug !== slug) return false;
    if (!env.getInlineAnchor(state.slug)) return false;

    state = reduceDockState(state, { type: 'show-inline', slug: state.slug });
    refresh(true);
    return true;
  }

  function showFloating(options = {}) {
    if (!state || !activeIframe) return false;

    state = reduceDockState(state, {
      type: 'show-floating',
      expand: options.expand,
      pinned: options.pinned,
    });
    refresh(true);
    return true;
  }

  function toggleExpanded(force) {
    if (!state || state.mode !== 'floating') return;
    state = reduceDockState(state, { type: 'toggle-expanded', force });
    refresh(true);
  }

  function refreshInlinePosition() {
    if (state?.mode !== 'inline') return;

    const anchor = env.getInlineAnchor(state.slug);
    const dockRoot = env.getRoot();
    if (!anchor || !dockRoot) return;

    const anchorRect = anchor.getBoundingClientRect();
    const dockRect = dockRoot.getBoundingClientRect();
    const moved =
      Math.abs(anchorRect.top - dockRect.top) > 1 || Math.abs(anchorRect.left - dockRect.left) > 1;

    if (moved) env.applyInlinePosition(anchor);
  }

  function startInlinePositionWatch() {
    inlineWatchUntil = env.now() + 3000;

    const tick = () => {
      refreshInlinePosition();
      if (env.now() < inlineWatchUntil) env.requestFrame(tick);
    };

    env.requestFrame(tick);
  }

  document.addEventListener('astro:after-swap', queueRefresh);
  document.addEventListener('astro:page-load', queueRefresh);
  window.addEventListener('resize', queueRefresh);
  document.addEventListener('scroll', queueRefresh, true);
  document.addEventListener('astro:page-load', startInlinePositionWatch);
  window.addEventListener('load', () => {
    inlineWatchUntil = Math.max(inlineWatchUntil, env.now() + 2000);
  });
  startInlinePositionWatch();

  return {
    activate,
    close,
    showInline,
    showFloating,
    toggleExpanded,
    refresh: () => refresh(true),
    shouldRestoreInline: (slug) => shouldRestoreInline(state) && (!slug || state?.slug === slug),
    getState,
  };
}
