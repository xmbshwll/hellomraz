/**
 * Map viewport: the zoom and pan transform for the geo map.
 *
 * The module owns k, tx, ty and the coordinate math around them. The page
 * injects the measurement and the transform sink, so the math stays testable
 * without a DOM.
 */

/** Reference width of the map viewBox, used by the scale helpers. */
export const MAP_REFERENCE_WIDTH = 960;

/** Zoom limits, shared with the page controls. */
export const MIN_K = 1;
export const MAX_K = 400;

/**
 * @typedef {{
 *   getRect: () => { left: number, top: number, width: number },
 *   onApply: () => void,
 *   referenceWidth?: number,
 * }} MapViewportDeps
 *
 * @typedef {{ k: number, tx: number, ty: number }} MapTransform
 */

/**
 * Create the transform state for one map.
 *
 * @param {MapViewportDeps} deps
 */
export function createMapViewport({ getRect, onApply, referenceWidth = MAP_REFERENCE_WIDTH }) {
  let k = 1;
  let tx = 0;
  let ty = 0;

  /** CSS-pixel scale: how many screen px per svg user unit. */
  function scale() {
    return getRect().width / referenceWidth;
  }

  /**
   * Adapt dot sizes to the rendered map width.
   * It is 1 at the reference width, and clamped so dots stay tappable and not
   * oversized.
   */
  function uiScale() {
    const width = getRect().width || referenceWidth;
    return Math.min(1.5, Math.max(0.7, width / referenceWidth));
  }

  /** Convert a client point to transformed svg user coordinates. */
  function toUserPoint(clientX, clientY) {
    const rect = getRect();
    const s = scale();
    return { x: (clientX - rect.left) / s, y: (clientY - rect.top) / s };
  }

  function applyTransform() {
    onApply();
  }

  function zoomAt(sx, sy, factor) {
    const cx = (sx - tx) / k;
    const cy = (sy - ty) / k;
    const next = Math.min(MAX_K, Math.max(MIN_K, k * factor));
    if (next === k) return;
    tx = sx - cx * next;
    ty = sy - cy * next;
    k = next;
    applyTransform();
  }

  /** Local point (pre-transform) to transformed user coordinates. */
  function projectMarker(point) {
    return { x: point.x * k + tx, y: point.y * k + ty };
  }

  /** @returns {MapTransform} */
  function getTransform() {
    return { k, tx, ty };
  }

  /** @param {MapTransform} next */
  function setTransform(next) {
    k = next.k;
    tx = next.tx;
    ty = next.ty;
  }

  return {
    scale,
    uiScale,
    toUserPoint,
    applyTransform,
    zoomAt,
    projectMarker,
    getTransform,
    setTransform,
  };
}
