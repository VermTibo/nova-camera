import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { labelGeometry } from "./labelGeometry";
import { surfaceTexture } from "./surfaces";
import type { ThreeElements } from "@react-three/fiber";
export type V3 = [number, number, number];
type PartProps = {
  position?: V3;
  rotation?: V3;
  color?: string;
  metalness?: number;
  roughness?: number;
};
export function Block({
  size,
  surface,
  radius = 0.06,
  color = "#202223",
  metalness = 0.65,
  roughness = 0.35,
  ...props
}: PartProps & {
  size: V3;
  radius?: number;
  surface?: "rubber" | "brushed" | "leather" | "walnut";
}) {
  const bump = useMemo(
    () => (surface ? surfaceTexture(surface) : null),
    [surface],
  );
  useEffect(() => () => bump?.dispose(), [bump]);
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={5}
      {...props}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        bumpMap={bump}
        bumpScale={surface === "brushed" ? 0.004 : 0.012}
      />
    </RoundedBox>
  );
}
export function Cylinder({
  radius,
  length,
  position,
  color = "#242627",
  metalness = 0.8,
  roughness = 0.3,
  rotation = [Math.PI / 2, 0, 0],
  ...props
}: PartProps & { radius: number; length: number } & Omit<
    ThreeElements["mesh"],
    "position" | "rotation"
  >) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      {...props}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[radius, radius, length, 80]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}
export function Ring({
  radius,
  tube = 0.025,
  color = "#9c9d98",
  position,
  rotation = [0, 0, 0],
}: PartProps & { radius: number; tube?: number }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <torusGeometry args={[radius, tube, 10, 80]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.26} />
    </mesh>
  );
}
export function Screw({
  position,
  rotation = [0, 0, 0],
}: {
  position: V3;
  rotation?: V3;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Cylinder radius={0.035} length={0.009} color="#777c7d" />
      <Block
        size={[0.045, 0.009, 0.011]}
        radius={0.003}
        color="#151718"
        position={[0, 0, 0.009]}
      />
    </group>
  );
}
export function Label({
  text,
  position,
  rotation = [0, 0, 0],
  width = 0.8,
  height = 0.15,
  color = "#dadcd6",
  size = 80,
  font = "Arial, sans-serif",
  weight = 500,
  radius,
  curveAxis = "x",
}: {
  text: string;
  position: V3;
  rotation?: V3;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
  font?: string;
  weight?: number;
  radius?: number;
  curveAxis?: "x" | "y";
}) {
  const anisotropy = useThree(s => s.gl.capabilities.getMaxAnisotropy());
  const geometry = useMemo(() => labelGeometry(width, height, radius, curveAxis), [width, height, radius, curveAxis]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.max(64, Math.round(1024 * height / width));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const metrics = ctx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || size * .75;
    const descent = metrics.actualBoundingBoxDescent || 0;
    const fit = Math.min(canvas.width * .9 / Math.max(metrics.width, 1), canvas.height * .78 / Math.max(ascent + descent, 1));
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(fit, fit);
    ctx.fillText(text, 0, (ascent - descent) / 2);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(16, anisotropy);
    return t;
  }, [text, color, size, font, weight, anisotropy, width, height]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation} scale={[-1, 1, 1]} geometry={geometry}>
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.02}
        toneMapped={false}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}
export function Knurl({
  radius,
  length,
  position = [0, 0, 0],
  count = 96,
  color = "#181a1b",
}: {
  radius: number;
  length: number;
  position?: V3;
  count?: number;
  color?: string;
}) {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(0.016, 0.018, length),
    [length],
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.35,
        roughness: 0.6,
      }),
    [color],
  );
  const object = useMemo(() => {
    const inst = new THREE.InstancedMesh(geometry, material, count);
    const m = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      m.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      m.rotation.set(0, 0, a);
      m.updateMatrix();
      inst.setMatrixAt(i, m.matrix);
    }
    return inst;
  }, [geometry, material, count, radius]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      object.dispose();
    },
    [geometry, material, object],
  );
  return <primitive object={object} position={position} />;
}

export function Barrel({
  radius,
  inner,
  length,
  position,
  color = "#929992",
}: {
  radius: number;
  inner: number;
  length: number;
  position: V3;
  color?: string;
}) {
  const geometry = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(inner, -length / 2),
          new THREE.Vector2(radius, -length / 2),
          new THREE.Vector2(radius, length / 2),
          new THREE.Vector2(inner, length / 2),
          new THREE.Vector2(inner, -length / 2),
        ],
        80,
      ),
    [radius, inner, length],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      geometry={geometry}
      castShadow
    >
      <meshStandardMaterial color={color} metalness={0.86} roughness={0.28} />
    </mesh>
  );
}

/** Printed lettering follows the front annulus instead of floating across the glass. */
export function RimLabel({ text, radius, z }: { text: string; radius: number; z: number }) {
  const anisotropy = useThree(s => s.gl.capabilities.getMaxAnisotropy());
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    const inkRadius = 960;
    ctx.font = '500 40px Arial, sans-serif';
    ctx.fillStyle = '#d5d8d8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const glyphs = Array.from(text);
    const advances = glyphs.map(char => ctx.measureText(char).width + 5);
    const length = advances.reduce((sum, value) => sum + value, 0);
    let cursor = -length / 2;
    for (let i = 0; i < glyphs.length; i++) {
      const angle = (cursor + advances[i] / 2) / inkRadius;
      ctx.save();
      ctx.translate(1024 + Math.sin(angle) * inkRadius, 1024 + Math.cos(angle) * inkRadius);
      ctx.rotate(-angle);
      ctx.fillText(glyphs[i], 0, 0);
      ctx.restore();
      cursor += advances[i];
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(16, anisotropy);
    // The product is mirrored to match the reference body's grip orientation.
    map.repeat.x = -1;
    map.offset.x = 1;
    return map;
  }, [text, anisotropy]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 0, z]}>
    <ringGeometry args={[radius * .89, radius * .98, 128]} />
    <meshBasicMaterial map={texture} transparent alphaTest={.02} depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-1} />
  </mesh>;
}
