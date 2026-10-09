import * as THREE from "three";
/** Deterministic procedural micro-surfaces: no external texture requests. */
export function surfaceTexture(
  kind: "rubber" | "brushed" | "leather" | "walnut",
) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(256, 256);
  let seed = 1983;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      const noise = random();
      const v =
        kind === "brushed"
          ? 130 + Math.sin(y * 3.4) * 30 + noise * 20
          : kind === "walnut"
            ? 120 +
              Math.sin(x * 0.18 + Math.sin(y * 0.02) * 2) * 30 +
              noise * 15
            : kind === "leather"
              ? 90 + noise * 130
              : 80 + noise * 155;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === "walnut" ? 2 : 4, kind === "walnut" ? 1 : 4);
  texture.anisotropy = 4;
  return texture;
}
