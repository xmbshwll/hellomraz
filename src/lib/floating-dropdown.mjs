/**
 * @typedef {{
 *   left: number;
 *   top: number;
 *   width: number;
 *   maxHeight: number;
 * }} FloatingPosition
 *
 * @typedef {{
 *   align?: 'start' | 'end';
 *   width?: number | 'anchor' | ((anchorRect: DOMRect | DOMRectReadOnly) => number);
 *   minWidth?: number;
 *   maxWidth?: number;
 *   maxHeight?: number;
 *   minHeight?: number;
 *   offset?: number;
 *   viewportPadding?: number;
 *   viewportWidth?: number;
 *   viewportHeight?: number;
 *   flip?: boolean;
 *   flipThreshold?: number;
 * }} FloatingPositionOptions
 */

/**
 * Compute a viewport-safe floating panel position.
 *
 * @param {DOMRect | DOMRectReadOnly} anchorRect
 * @param {FloatingPositionOptions} [options]
 * @returns {FloatingPosition}
 */
export function computeFloatingPosition(anchorRect, options = {}) {
  const viewportPadding = options.viewportPadding ?? 4;
  const viewportWidth = options.viewportWidth ?? 1024;
  const viewportHeight = options.viewportHeight ?? 768;
  const offset = options.offset ?? 4;
  const align = options.align ?? "start";
  const flipThreshold = options.flipThreshold ?? 160;
  const maxPanelHeight = options.maxHeight ?? 320;

  let width;
  if (typeof options.width === "function") {
    width = options.width(anchorRect);
  } else if (options.width == null || options.width === "anchor") {
    width = anchorRect.width;
  } else {
    width = options.width;
  }

  if (options.minWidth != null) width = Math.max(width, options.minWidth);
  if (options.maxWidth != null) width = Math.min(width, options.maxWidth);
  width = Math.min(width, Math.max(0, viewportWidth - viewportPadding * 2));

  let left = align === "end" ? anchorRect.right - width : anchorRect.left;
  if (left + width > viewportWidth - viewportPadding) {
    left = viewportWidth - width - viewportPadding;
  }
  if (left < viewportPadding) left = viewportPadding;

  let top = anchorRect.bottom + offset;
  let maxHeight = Math.min(
    maxPanelHeight,
    Math.max(0, viewportHeight - top - viewportPadding),
  );

  if (options.flip !== false) {
    const aboveAvailable = Math.max(
      0,
      anchorRect.top - viewportPadding - offset,
    );
    if (maxHeight < flipThreshold && aboveAvailable > maxHeight) {
      maxHeight = Math.min(maxPanelHeight, aboveAvailable);
      top = Math.max(viewportPadding, anchorRect.top - maxHeight - offset);
    }
  }

  if (options.minHeight != null)
    maxHeight = Math.max(maxHeight, options.minHeight);

  return {
    left,
    top,
    width,
    maxHeight,
  };
}

/**
 * @typedef {{
 *   getAnchor: () => HTMLElement | null;
 *   getPanel: () => HTMLElement | null;
 *   useOverlay?: boolean;
 *   zIndex?: number;
 *   position?: FloatingPositionOptions;
 *   setPanelOpen?: (panel: HTMLElement, open: boolean) => void;
 *   onOpenChange?: (open: boolean, panel: HTMLElement | null) => void;
 *   onAfterOpen?: (panel: HTMLElement, anchor: HTMLElement) => void;
 * }} FloatingDropdownOptions
 */

/**
 * Shared floating dropdown controller for body-ported panels.
 * Handles body portal mounting, outside click, escape, resize/scroll reposition,
 * and optional overlay management.
 *
 * @param {FloatingDropdownOptions} options
 */
export function createFloatingDropdown(options) {
  let isOpen = false;
  let panel = null;
  let overlay = null;
  let positionRaf = 0;

  const zIndex = options.zIndex ?? 99999;

  function ensurePanel() {
    const resolved = options.getPanel();
    if (!resolved) return null;
    panel = resolved;

    if (!panel.isConnected || panel.parentNode !== document.body) {
      document.body.appendChild(panel);
    }

    return panel;
  }

  function ensureOverlay() {
    if (!options.useOverlay) return null;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.style.cssText = `position:fixed;inset:0;z-index:${zIndex - 1};display:none;`;
      overlay.addEventListener("click", close);
      document.body.appendChild(overlay);
    } else if (!overlay.isConnected) {
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function setPanelOpen(open) {
    const currentPanel = panel || ensurePanel();
    if (!currentPanel) return;

    if (options.setPanelOpen) {
      options.setPanelOpen(currentPanel, open);
      return;
    }

    currentPanel.hidden = !open;
    currentPanel.style.opacity = open ? "1" : "0";
    currentPanel.style.pointerEvents = open ? "auto" : "none";
  }

  function updatePosition() {
    if (!isOpen) return;

    const anchor = options.getAnchor();
    const currentPanel = ensurePanel();
    if (!anchor || !currentPanel) return;

    const position = computeFloatingPosition(anchor.getBoundingClientRect(), {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      ...(options.position ?? {}),
    });

    currentPanel.style.left = `${position.left}px`;
    currentPanel.style.top = `${position.top}px`;
    currentPanel.style.width = `${position.width}px`;
    currentPanel.style.maxHeight = `${position.maxHeight}px`;
    currentPanel.style.zIndex = String(zIndex);
  }

  function schedulePosition() {
    if (!isOpen || positionRaf) return;
    positionRaf = window.requestAnimationFrame(() => {
      positionRaf = 0;
      updatePosition();
    });
  }

  function open() {
    const anchor = options.getAnchor();
    const currentPanel = ensurePanel();
    if (!anchor || !currentPanel) return;

    const currentOverlay = ensureOverlay();
    if (currentOverlay) currentOverlay.style.display = "block";

    isOpen = true;
    setPanelOpen(true);
    updatePosition();
    options.onOpenChange?.(true, currentPanel);
    options.onAfterOpen?.(currentPanel, anchor);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    if (positionRaf) {
      window.cancelAnimationFrame(positionRaf);
      positionRaf = 0;
    }

    setPanelOpen(false);
    if (overlay) overlay.style.display = "none";
    options.onOpenChange?.(false, panel);
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  document.addEventListener("click", (event) => {
    if (!isOpen) return;

    const target = event.target;
    if (!(target instanceof Node)) return;

    const anchor = options.getAnchor();
    const currentPanel = panel || ensurePanel();
    if (anchor?.contains(target) || currentPanel?.contains(target)) return;

    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) close();
  });

  window.addEventListener("resize", schedulePosition);
  document.addEventListener("scroll", schedulePosition, true);

  return {
    open,
    close,
    toggle,
    schedulePosition,
    isOpen: () => isOpen,
    getPanel: () => panel || ensurePanel(),
  };
}
