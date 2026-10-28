import { motionDamp } from "./motion";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lenses } from "../data/catalog";
import { useCamera } from "../state/cameraStore";
import { Barrel, Block, Cylinder, Knurl, Label, RimLabel, Ring, Screw } from "./Parts";
export function Lens({ explode }: { explode: boolean }) {
  const c = useCamera((s) => s.config),
    select = useCamera((s) => s.select);
  const root = useRef<THREE.Group>(null),
    mount = useRef<THREE.Group>(null);
  const lens = lenses.find((l) => l.id === c.lens)!;
  const r = lens.radius,
    l = lens.length;
  const silver = c.lensFinish === "Silver";
  useEffect(() => {
    if (root.current) {
      root.current.position.z = 1.15;
      root.current.rotation.z = -0.12;
    }
  }, [c.lens]);
  useFrame((_, dt) => {
    if (root.current) {
      root.current.position.z = motionDamp(
        root.current.position.z,
        explode ? 1.25 : 0,
        7,
        dt,
      );
      root.current.rotation.z = motionDamp(root.current.rotation.z, 0, 7, dt);
    }
    if (mount.current)
      mount.current.position.z = motionDamp(
        mount.current.position.z,
        explode ? 0.45 : 0,
        7,
        dt,
      );
  });
  const base = c.mount === "PL adapter" ? 0.87 : 0.72;
  return (
    <group
      position={[-0.22, -0.04, 0]}
      name="Lens"
      onClick={(e) => {
        e.stopPropagation();
        select("Lens");
      }}
    >
      <Cylinder
        radius={0.68}
        length={0.025}
        position={[0, 0, 0.503]}
        color="#090e0b"
      />
      <Block
        size={[0.85, 0.58, 0.012]}
        radius={0.016}
        position={[0, 0, 0.52]}
        color={c.sensor === "Monochrome" ? "#414847" : "#325357"}
        roughness={0.15}
      />
      <group ref={mount} name="LensMount">
        <Barrel
          radius={0.825}
          inner={0.64}
          length={0.15}
          position={[0, 0, 0.51]}
          color="#181c1b"
        />
        <Barrel
          radius={0.784}
          inner={0.65}
          length={0.06}
          position={[0, 0, 0.61]}
          color="#aeb4b1"
        />
        <Ring
          radius={0.776}
          tube={0.017}
          position={[0, 0, 0.65]}
          color="#c65324"
        />
        {[0, 1, 2, 3].map((i) => (
          <Screw
            key={i}
            position={[
              Math.cos((i * Math.PI) / 2 + 0.3) * 0.735,
              Math.sin((i * Math.PI) / 2 + 0.3) * 0.735,
              0.654,
            ]}
          />
        ))}
        {c.mount === "PL adapter" && (
          <Barrel
            radius={0.78}
            inner={0.64}
            length={0.19}
            position={[0, 0, 0.73]}
            color="#858a83"
          />
        )}
      </group>
      <group ref={root} name={`Lens-${c.lens}`}>
        <Cylinder
          radius={0.66}
          length={0.21}
          position={[0, 0, base]}
          color="#191c1b"
        />
        <Cylinder
          radius={r * 0.94}
          length={l}
          position={[0, 0, base + l / 2]}
          color={silver ? "#a6aaa5" : "#181818"}
          metalness={0.35}
          roughness={0.46}
        />
        <Cylinder
          radius={r}
          length={l * 0.3}
          position={[0, 0, base + l * 0.3]}
          color="#1c1f1e"
          metalness={0.15}
          roughness={0.72}
        />
        <Knurl
          radius={r + 0.002}
          length={l * 0.29}
          position={[0, 0, base + l * 0.3]}
        />
        <Cylinder
          radius={r * 0.97}
          length={l * 0.19}
          position={[0, 0, base + l * 0.72]}
          color="#181b1a"
          metalness={0.25}
          roughness={0.7}
        />
        <Knurl
          radius={r * 0.977}
          length={l * 0.18}
          position={[0, 0, base + l * 0.72]}
        />
        {[0.03, 0.13, 0.48, 0.58, 0.85, 0.98].map((t, i) => (
          <Ring
            key={t}
            radius={r * (i === 0 ? 0.92 : 0.946)}
            tube={i === 4 ? 0.014 : 0.008}
            position={[0, 0, base + l * t]}
            color={silver ? "#dddeda" : "#383838"}
          />
        ))}
        <Label
          text={`FE ${lens.name} F${lens.aperture} GM`}
          color={silver ? "#141b23" : "#dadcd6"}
          position={[0, r * 0.94 + 0.003, base + l * 0.53]}
          radius={r * 0.94}
          rotation={[-Math.PI / 2, 0, 0]}
          width={r * 1.18}
          height={Math.min(0.11, l * 0.075)}
        />
        <Label
          text="0.4   0.7   1   2   5   ∞"
          color={silver ? "#141b23" : "#dadcd6"}
          position={[0, r * 0.94 + 0.003, base + l * 0.08]}
          radius={r * 0.94}
          rotation={[-Math.PI / 2, 0, 0]}
          width={r * 1.05}
          height={0.055}
        />
        <Block
          size={[0.16, 0.03, 0.1]}
          radius={0.01}
          position={[0, r + 0.012, base + l * 0.16]}
          color="#b3b8ab"
        />
        <group position={[-r * 0.95, 0, base + l * 0.53]} rotation={[0, -Math.PI / 2, 0]}>
          <Block size={[0.21, 0.24, 0.025]} radius={0.025} color="#c65324" metalness={0.1} />
          <Label text="G" position={[0, 0, 0.019]} width={0.18} height={0.23} weight={700} color="#ffffff" />
        </group>
        <group position={[r * 0.95, 0, base + l * 0.53]} rotation={[0, Math.PI / 2, 0]}>
          <Cylinder radius={0.11} length={0.045} color="#080808" />
          
          
        </group>
        <group position={[0, 0, base + l]} name="FrontGlass">
          <Barrel
            radius={r * 0.985}
            inner={r * 0.88}
            position={[0,0,0]}
            length={0.115}
            color={silver ? "#9da39e" : "#242827"}
          />
          <Barrel
            radius={r * 0.88}
            inner={r * 0.735}
            position={[0,0,0]}
            length={0.118}
            color="#090e0e"
          />
          {[0.82, 0.74, 0.64].map((s, i) => (
            <Ring
              key={s}
              radius={r * s}
              tube={0.013}
              position={[0, 0, 0.063 - i * 0.009]}
              color={i === 0 ? "#555e57" : "#152c2c"}
            />
          ))}
          <mesh position={[0, 0, 0.024]}>
            <circleGeometry args={[r * 0.73, 96]} />
            <meshStandardMaterial
              color="#080f14"
              metalness={0.5}
              roughness={0.24}
            />
          </mesh>
          {[0.65, 0.55, 0.45, 0.35].map((scale, i) => (
            <Ring
              key={scale}
              radius={r * scale}
              tube={0.006}
              position={[0, 0, 0.03 + i * 0.003]}
              color={["#243c40", "#132428", "#23343e", "#142028"][i]}
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 9) * r * 0.18,
                Math.sin((i * Math.PI * 2) / 9) * r * 0.18,
                0.045,
              ]}
              rotation={[0, 0, (i * Math.PI * 2) / 9 + 0.5]}
            >
              <circleGeometry args={[r * 0.23, 3]} />
              <meshStandardMaterial
                color="#102b2b"
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          ))}
          <Cylinder
            radius={r * 0.13}
            length={0.012}
            position={[0, 0, 0.047]}
            color="#010809"
          />
          <mesh
            position={[0, 0, 0.025]}
            scale={[1, 1, 0.12]}
          >
            <sphereGeometry args={[r * 0.725, 64, 32]} />
            <meshPhysicalMaterial
              color={c.filter === "ND" ? "#152322" : "#30484b"}
              transparent
              opacity={c.filter === "ND" ? 0.48 : 0.22}
              roughness={0.07}
              metalness={0.15}
              clearcoat={1}
              clearcoatRoughness={0.025}
              side={THREE.FrontSide}
              depthWrite={false}
            />
          </mesh>
          <RimLabel text={`SONY FE  ·  ${lens.name}  F${lens.aperture}  ·  Ø${Math.round(r * 90)}${c.filter === "None" ? "" : `  ·  ${c.filter}`}`} radius={r} z={c.filter === "None" ? 0.061 : 0.138} />
          {c.filter !== "None" && (
            <>
              <Ring
                radius={r * 0.97}
                tube={0.025}
                position={[0, 0, 0.115]}
                color={c.filter === "ND" ? "#ab955d" : "#a7b1a5"}
              />
              <Barrel radius={r * .985} inner={r * .88} length={.035} position={[0, 0, .115]} color="#202526" />
            </>
          )}
          {c.hood && (
            <group position={[0, 0, 0.38]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry
                  args={[r * 0.99, r * 1.19, 0.62, 80, 1, true]}
                />
                <meshStandardMaterial
                  color={silver ? "#9a9f99" : "#151918"}
                  side={THREE.DoubleSide}
                  metalness={0.3}
                  roughness={0.52}
                />
              </mesh>
              <Ring
                radius={r * 1.19}
                tube={0.02}
                position={[0, 0, 0.31]}
                color="#333a33"
              />
            </group>
          )}
        </group>
      </group>
    </group>
  );
}
