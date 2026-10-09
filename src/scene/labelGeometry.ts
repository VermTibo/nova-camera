import { PlaneGeometry } from 'three';

/** Bend a decal onto a cylindrical surface, keeping its ink just above the shell. */
export function labelGeometry(width: number, height: number, radius?: number, axis: 'x' | 'y' = 'x') {
  const geometry = new PlaneGeometry(width, height, radius && axis === 'x' ? 48 : 1, radius && axis === 'y' ? 24 : 1);
  if (radius) {
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const coordinate = axis === 'x' ? points.getX(i) : points.getY(i);
      const angle = coordinate / radius;
      if (axis === 'x') points.setX(i, radius * Math.sin(angle));
      else points.setY(i, radius * Math.sin(angle));
      points.setZ(i, radius * (Math.cos(angle) - 1));
    }
    geometry.computeVertexNormals();
  }
  return geometry;
}
