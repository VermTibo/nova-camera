/** Unwrap a destination angle so a preset takes the shortest orbit around the model. */
export function nearestOrbitAngle(current: number, destination: number) {
  const turn = Math.PI * 2;
  return current + ((destination - current + Math.PI) % turn + turn) % turn - Math.PI;
}
