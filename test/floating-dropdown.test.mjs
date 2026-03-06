import test from "node:test";
import assert from "node:assert/strict";

import { computeFloatingPosition } from "../src/lib/floating-dropdown.mjs";

test("computeFloatingPosition matches anchor width and stays below when space allows", () => {
  const position = computeFloatingPosition(
    {
      left: 100,
      top: 40,
      right: 340,
      bottom: 84,
      width: 240,
      height: 44,
    },
    {
      width: "anchor",
      offset: 6,
      viewportWidth: 1280,
      viewportHeight: 900,
      viewportPadding: 4,
      maxHeight: 352,
    },
  );

  assert.deepEqual(position, {
    left: 100,
    top: 90,
    width: 240,
    maxHeight: 352,
  });
});

test("computeFloatingPosition flips above when bottom space is too small", () => {
  const position = computeFloatingPosition(
    {
      left: 24,
      top: 520,
      right: 304,
      bottom: 564,
      width: 280,
      height: 44,
    },
    {
      width: 280,
      offset: 4,
      viewportWidth: 390,
      viewportHeight: 640,
      viewportPadding: 4,
      maxHeight: 400,
      flipThreshold: 160,
    },
  );

  assert.deepEqual(position, {
    left: 24,
    top: 116,
    width: 280,
    maxHeight: 400,
  });
});

test("computeFloatingPosition end-aligns and clamps within viewport", () => {
  const position = computeFloatingPosition(
    {
      left: 8,
      top: 50,
      right: 80,
      bottom: 94,
      width: 72,
      height: 44,
    },
    {
      align: "end",
      width: 200,
      offset: 4,
      viewportWidth: 220,
      viewportHeight: 500,
      viewportPadding: 4,
      maxHeight: 300,
    },
  );

  assert.deepEqual(position, {
    left: 4,
    top: 98,
    width: 200,
    maxHeight: 300,
  });
});

test("computeFloatingPosition respects min width and min height", () => {
  const position = computeFloatingPosition(
    {
      left: 20,
      top: 10,
      right: 80,
      bottom: 54,
      width: 60,
      height: 44,
    },
    {
      width: "anchor",
      minWidth: 220,
      minHeight: 120,
      maxHeight: 320,
      offset: 6,
      viewportWidth: 500,
      viewportHeight: 160,
      viewportPadding: 4,
    },
  );

  assert.deepEqual(position, {
    left: 20,
    top: 60,
    width: 220,
    maxHeight: 120,
  });
});
