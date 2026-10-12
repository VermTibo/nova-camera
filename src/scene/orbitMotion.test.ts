import test from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Spherical, Vector3 } from "three";
import { nearestOrbitAngle, viewPositions } from "./orbitMotion";

test("top view keeps the body horizontal and the lens pointing down from every preset", () => {
  const top = new Spherical().setFromVector3(new Vector3(...viewPositions.Top));
  for (const start of Object.values(viewPositions)) {
    const current = new Spherical().setFromVector3(new Vector3(...start));
    const destination = new Spherical(top.radius, top.phi, nearestOrbitAngle(current.theta, top.theta));
    destination.makeSafe();
    const camera = new PerspectiveCamera(37, 1, .1, 250);
    camera.position.setFromSpherical(destination);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const left = new Vector3(-1, 0, 0).project(camera);
    const right = new Vector3(1, 0, 0).project(camera);
    const lens = new Vector3(0, 0, 2).project(camera);
    assert.ok(Math.abs(left.y - right.y) < 1e-8, "body stays level");
    assert.ok(Math.abs(lens.x) < 1e-8, "lens stays centered");
    assert.ok(lens.y < 0, "lens points toward the bottom of the screen");
    assert.ok(camera.position.y / camera.position.length() > .99999, "view is overhead");
  }
});

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
