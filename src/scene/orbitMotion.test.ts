import test from "node:test";
import assert from "node:assert/strict";
import { nearestOrbitAngle } from "./orbitMotion";

test("preset transitions cross the angle seam by the shortest route", () => {
  for (const current of [-12, -Math.PI + .01, 0, Math.PI - .01, 15]) {
    for (const target of [-Math.PI, -.5, 0, Math.PI]) {
      const result = nearestOrbitAngle(current, target);
      assert.ok(Math.abs(result - current) <= Math.PI + 1e-10);
      assert.ok(Math.abs(Math.sin(result) - Math.sin(target)) < 1e-10);
      assert.ok(Math.abs(Math.cos(result) - Math.cos(target)) < 1e-10);
    }
  }
  assert.ok(Math.abs(nearestOrbitAngle(Math.PI - .01, -Math.PI + .01) - (Math.PI + .01)) < 1e-10);
});
