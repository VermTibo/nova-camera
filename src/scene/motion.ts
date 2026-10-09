import { MathUtils } from "three";
const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
export const motionDamp = (
  current: number,
  target: number,
  smoothing: number,
  delta: number,
) =>
  preference.matches
    ? target
    : MathUtils.damp(current, target, smoothing, delta);
