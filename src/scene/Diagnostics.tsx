import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
export function Diagnostics() {
  const [report, setReport] = useState("");
  let frames = 0;
  let elapsed = 0;
  useFrame(({ gl, camera }, dt) => {
    frames++;
    elapsed += dt;
    if (elapsed > 0.75) {
      setReport(
        `${Math.round(frames / elapsed)} FPS · ${gl.info.render.calls} DRAWS · ${Math.round(gl.info.render.triangles / 1000)}K TRIANGLES\nCAMERA ${camera.position
          .toArray()
          .map((n) => n.toFixed(2))
          .join(
            " / ",
          )}\nWEBGL 2 · ${gl.capabilities.maxTextureSize}px MAX TEXTURE`,
      );
      frames = 0;
      elapsed = 0;
    }
  });
  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <pre
        style={{
          position: "absolute",
          top: 0,
          left: 20,
          fontSize: 10,
          color: "#c8dcaa",
          background: "#10180ccc",
          padding: 10,
        }}
      >
        {report}
      </pre>
    </Html>
  );
}
