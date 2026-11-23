import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clusterByDistance, fitToPoints, hitTestMarkers } from '../src/lib/map-view.mjs';
import { createMapViewport, MAX_K, MIN_K } from '../src/lib/map-viewport.mjs';

test('clusterByDistance groups points under the threshold', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 100, y: 100 },
  ];
  const groups = clusterByDistance(points, 5);

  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0], [0, 1]);
  assert.deepEqual(groups[1], [2]);
});

test('clusterByDistance splits one group as the threshold shrinks', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ];

  assert.equal(clusterByDistance(points, 6).length, 1);
  assert.equal(clusterByDistance(points, 4).length, 2);
});

test('clusterByDistance returns no groups for no points', () => {
  assert.deepEqual(clusterByDistance([], 5), []);
});

test('hitTestMarkers prefers the nearest marker inside its radius', () => {
  const markers = [
    { kind: 'city', x: 0, y: 0, screenR: 4 },
    { kind: 'city', x: 40, y: 0, screenR: 4 },
  ];
  const view = { k: 1, tx: 0, ty: 0, scale: 1 };

  assert.equal(hitTestMarkers({ x: 2, y: 0 }, markers, view), markers[0]);
  assert.equal(hitTestMarkers({ x: 38, y: 0 }, markers, view), markers[1]);
});

test('hitTestMarkers returns null away from every marker', () => {
  const markers = [{ kind: 'city', x: 0, y: 0, screenR: 4 }];
  const view = { k: 1, tx: 0, ty: 0, scale: 1 };

  assert.equal(hitTestMarkers({ x: 500, y: 500 }, markers, view), null);
});

test('hitTestMarkers gives a bigger marker a larger hit radius', () => {
  const view = { k: 1, tx: 0, ty: 0, scale: 1 };
  const point = { x: 20, y: 0 };
  const city = [{ kind: 'city', x: 0, y: 0, screenR: 20 }];
  const state = [{ kind: 'state', x: 0, y: 0, screenR: 20 }];

  assert.equal(hitTestMarkers(point, city, view), null);
  assert.equal(hitTestMarkers(point, state, view), state[0]);
});

test('fitToPoints centers the group and never zooms out', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
  ];
  const result = fitToPoints(points, { k: 2, width: 800, height: 400, maxK: 400 });

  assert.ok(result);
  assert.ok(result.k >= 2, 'zoom must not decrease');
  // Centering: the group midpoint maps to the viewport centre.
  const cx = (0 + 100) / 2;
  const cy = (0 + 100) / 2;
  assert.ok(Math.abs(cx * result.k + result.tx - 400) < 1e-6);
  assert.ok(Math.abs(cy * result.k + result.ty - 200) < 1e-6);
});

test('fitToPoints respects maxK and the minimum span', () => {
  const points = [{ x: 5, y: 5 }];
  const result = fitToPoints(points, { k: 1, width: 800, height: 400, maxK: 3 });

  assert.ok(result);
  assert.ok(result.k <= 3, 'zoom must respect the ceiling');
});

test('fitToPoints returns null for no points', () => {
  assert.equal(fitToPoints([], { k: 1, width: 800, height: 400, maxK: 400 }), null);
});

test('zoomAt clamps zoom between MIN_K and MAX_K', () => {
  let applied = 0;
  const viewport = createMapViewport({
    getRect: () => ({ left: 0, top: 0, width: 960 }),
    onApply: () => {
      applied += 1;
    },
  });

  viewport.zoomAt(0, 0, 1000);
  assert.equal(viewport.getTransform().k, MAX_K);

  viewport.zoomAt(0, 0, 1e-6);
  assert.equal(viewport.getTransform().k, MIN_K);

  assert.equal(applied, 2);
});

test('zoomAt keeps the anchor point fixed', () => {
  const viewport = createMapViewport({
    getRect: () => ({ left: 0, top: 0, width: 960 }),
    onApply: () => {},
  });
  const sx = 200;
  const sy = 120;
  const { k, tx, ty } = viewport.getTransform();
  const local = { x: (sx - tx) / k, y: (sy - ty) / k };

  viewport.zoomAt(sx, sy, 2);
  const after = viewport.projectMarker(local);

  assert.ok(Math.abs(after.x - sx) < 1e-9);
  assert.ok(Math.abs(after.y - sy) < 1e-9);
});

test('screen-to-map round trip recovers the projected point', () => {
  const viewport = createMapViewport({
    getRect: () => ({ left: 0, top: 0, width: 960 }),
    onApply: () => {},
  });
  viewport.setTransform({ k: 2, tx: 10, ty: -5 });
  const projected = viewport.projectMarker({ x: 3, y: 4 });

  const back = viewport.toUserPoint(projected.x, projected.y);

  assert.ok(Math.abs(back.x - projected.x) < 1e-9);
  assert.ok(Math.abs(back.y - projected.y) < 1e-9);
});
