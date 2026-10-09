import test from 'node:test';
import assert from 'node:assert/strict';
import { labelGeometry } from './labelGeometry';
import { lenses } from '../data/catalog';

test('barrel decals follow every lens surface instead of floating beyond the silhouette', () => {
  for (const lens of lenses) for (const axis of ['x', 'y'] as const) {
    const radius = lens.radius * .94;
    const geometry = labelGeometry(lens.radius * 1.18, .11, radius, axis);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const across = axis === 'x' ? positions.getX(i) : positions.getY(i);
      assert.ok(Math.abs(Math.hypot(across, positions.getZ(i) + radius) - radius) < 1e-6);
      assert.ok(positions.getZ(i) <= 0);
    }
    geometry.dispose();
  }
});

test('flat body badges remain flat and retain their requested dimensions', () => {
  const geometry = labelGeometry(.88, .26);
  geometry.computeBoundingBox();
  assert.ok(Math.abs(geometry.boundingBox!.max.x - .44) < 1e-6);
  assert.equal(geometry.boundingBox!.max.z, 0);
  geometry.dispose();
});
