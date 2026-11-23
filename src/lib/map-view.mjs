/**
 * Pure view-model helpers for the geo map. These cover the three math parts of
 * the map build: distance clustering, marker hit testing, and fit-to-points
 * framing. The map page keeps DOM wiring, listeners, transforms, and tooltips.
 */

/**
 * Connected-components clustering. Two points join when they sit closer than
 * the threshold, so one cluster splits apart as the zoom scales up.
 *
 * @param {Array<{ x: number, y: number }>} points Projected points in screen space.
 * @param {number} threshold Minimum distance between separate clusters.
 * @returns {number[][]} Groups of source indices, in first-seen order.
 */
export function clusterByDistance(points, threshold) {
  const n = points.length;
  const parent = Array.from({ length: n }, (_, index) => index);
  const find = (index) => (parent[index] === index ? index : (parent[index] = find(parent[index])));
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (dx * dx + dy * dy < threshold * threshold) union(i, j);
    }
  }

  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const list = groups.get(root) ?? [];
    list.push(i);
    groups.set(root, list);
  }

  return [...groups.values()];
}

/**
 * Nearest marker under a user-space point. Bigger markers use a larger hit
 * radius, and city dots use a fixed small radius.
 *
 * @param {{ x: number, y: number }} point User-space point.
 * @param {Array<{ kind: string, x: number, y: number, screenR: number }>} markers Rendered markers.
 * @param {{ k: number, tx: number, ty: number, scale: number }} view Transform and px-per-unit scale.
 * @returns {*} The best marker, or null.
 */
export function hitTestMarkers(point, markers, view) {
  const { k, tx, ty, scale } = view;
  let best = null;
  let bestDistance = Infinity;

  for (const marker of markers) {
    const hit = (marker.kind !== 'city' ? marker.screenR + 12 : 16) / scale;
    const x = marker.x * k + tx;
    const y = marker.y * k + ty;
    const dx = x - point.x;
    const dy = y - point.y;
    const distance = dx * dx + dy * dy;
    if (distance < hit * hit && distance < bestDistance) {
      bestDistance = distance;
      best = marker;
    }
  }

  return best;
}

/**
 * Zoom and pan so the given local-space points fill the viewport. The 80%
 * margin and the 6-unit minimum span match a map fit-bounds. A click never
 * zooms out, so the result keeps at least the current zoom.
 *
 * @param {Array<{ x: number, y: number }>} points Local-space points.
 * @param {{ k: number, width: number, height: number, maxK: number }} view
 * @returns {{ k: number, tx: number, ty: number } | null}
 */
export function fitToPoints(points, view) {
  if (!points.length) return null;
  const { k, width, height, maxK } = view;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padding = 1.6;
  const spanX = Math.max((maxX - minX) * padding, 6);
  const spanY = Math.max((maxY - minY) * padding, 6);
  const target = Math.min(width / spanX, height / spanY);
  const next = Math.min(maxK, Math.max(k * 1.25, target));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return {
    k: next,
    tx: width / 2 - cx * next,
    ty: height / 2 - cy * next,
  };
}
