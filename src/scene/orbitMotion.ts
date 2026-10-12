import type { View } from "../state/cameraStore";

export const viewPositions: Record<View, [number, number, number]> = {
  Hero: [5.4, 3.0, 7.6],
  Front: [0, 0.35, 8.6],
  Back: [0, 1, -8],
  // A tiny forward offset avoids the orbit pole while keeping the body horizontal.
  // Equal X/Z offsets would introduce a 45-degree heading in the overhead view.
  Top: [0, 8.8, 0.001],
  Side: [8.8, 0.8, 0.1],
  Detail: [2.1, 1.4, 4.1],
};

/** Unwrap a destination angle so a preset takes the shortest orbit around the model. */
export function nearestOrbitAngle(current: number, destination: number) {
  const turn = Math.PI * 2;
  return current + ((destination - current + Math.PI) % turn + turn) % turn - Math.PI;
}
