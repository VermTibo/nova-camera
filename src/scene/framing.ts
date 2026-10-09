export type Vector = readonly [number, number, number];
/** Fit every corner of the assembly to the current orbit angle and both viewport axes. */
export function fitBoxDistance(size: Vector, direction: Vector, verticalFov: number, aspect: number, padding = 1.1, frame: readonly [number, number] = [1, 1]) {
  const length = Math.hypot(...direction) || 1;
  const forward = direction.map(v => v / length);
  const horizontal = Math.hypot(forward[0], forward[2]);
  const right = horizontal > .00001 ? [forward[2] / horizontal, 0, -forward[0] / horizontal] : [1, 0, 0];
  const up = [
    forward[1] * right[2] - forward[2] * right[1],
    forward[2] * right[0] - forward[0] * right[2],
    forward[0] * right[1] - forward[1] * right[0],
  ];
  const tangent = Math.tan(verticalFov * Math.PI / 360);
  const verticalTangent = tangent * Math.max(frame[1], .01);
  const horizontalTangent = tangent * Math.max(aspect, .01) * Math.max(frame[0], .01);
  let distance = 0;
  for (const x of [-size[0] / 2, size[0] / 2])
    for (const y of [-size[1] / 2, size[1] / 2])
      for (const z of [-size[2] / 2, size[2] / 2]) {
        const depth = x * forward[0] + y * forward[1] + z * forward[2];
        const width = Math.abs(x * right[0] + y * right[1] + z * right[2]);
        const height = Math.abs(x * up[0] + y * up[1] + z * up[2]);
        distance = Math.max(distance, depth + padding * width / horizontalTangent, depth + padding * height / verticalTangent);
      }
  return Math.max(1, distance);
}

/** Leave room for the heading and controls without clipping the full-stage canvas. */
export function viewerFrame(width: number, height: number): readonly [number, number] {
  return [Math.max(.5, 1 - 48 / Math.max(width, 1)), Math.max(.35, 1 - 310 / Math.max(height, 1))];
}
