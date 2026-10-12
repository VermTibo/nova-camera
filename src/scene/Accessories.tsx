import { motionDamp } from "./motion";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCamera } from "../state/cameraStore";
import { Block, Cylinder, Knurl, Label, Ring, Screw, type V3 } from "./Parts";
export const attachmentPoints = {
  bottomMount: [0, -1.17, 0],
  leftMount: [-1.88, 0, 0],
  rightMount: [1.87, 0, 0],
  topMount: [0, 1.5, 0],
} satisfies Record<string, V3>;
function Strap() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.67, 0.55, 0),
    new THREE.Vector3(-2.15, -0.8, -0.3),
    new THREE.Vector3(-1.8, -2, -0.5),
    new THREE.Vector3(0, -2.55, -0.55),
    new THREE.Vector3(1.9, -2, -0.5),
    new THREE.Vector3(2.17, -0.8, -0.3),
    new THREE.Vector3(1.67, 0.55, 0),
  ]);
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 64, 0.058, 8, false]} />
      <meshStandardMaterial color="#434b3e" roughness={1} />
    </mesh>
  );
}
export function Accessories({ explode }: { explode: boolean }) {
  const c = useCamera((s) => s.config),
    a = c.accessories,
    select = useCamera((s) => s.select);
  const group = useRef<THREE.Group>(null);
  const hotY =
    c.viewfinder === "None" ? 1.1 : c.viewfinder === "Cinema" ? 1.70 : 1.58;
  useEffect(() => {
    if (
      group.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      group.current.position.y = 0.12;
  }, [a]);
  useFrame((_, dt) => {
    if (group.current)
      group.current.position.y = motionDamp(
        group.current.position.y,
        explode ? 0.45 : 0,
        6,
        dt,
      );
  });
  return (
    <group
      name="Accessories"
      onClick={(e) => {
        e.stopPropagation();
        select("Accessories");
      }}
    >
      <group ref={group}>
        {a.cage && (
          <group name="Cage">
            {[-1.81, 1.81].map((x) => (
              <group key={x}>
                <Block
                  size={[0.13, 2.48, 0.88]}
                  radius={0.04}
                  position={[x, 0.14, 0]}
                  color="#4b514d"
                />
                {Array.from({ length: 7 }, (_, i) => (
                  <Cylinder
                    key={i}
                    radius={0.041}
                    length={0.015}
                    position={[x, -0.75 + i * 0.29, 0.45]}
                    color="#101511"
                  />
                ))}
              </group>
            ))}
            {[1.39, -1.075].map((y) => (
              <group key={y}>
                <Block
                  size={[3.74, 0.14, 0.9]}
                  radius={0.04}
                  position={[0, y, 0]}
                  color="#454b48"
                />
                {Array.from({ length: 11 }, (_, i) => (
                  <Cylinder
                    key={i}
                    radius={0.043}
                    length={0.015}
                    rotation={[0, 0, 0]}
                    position={[-1.5 + i * 0.3, y + 0.078, 0.14]}
                    color="#111714"
                  />
                ))}
              </group>
            ))}
            <Label
              text="NOVA / RIG"
              position={[-1.1, 1.398, 0.46]}
              width={0.7}
              height={0.075}
            />
          </group>
        )}
        {a.topHandle && (
          <group name="TopHandle" position={[0, 1.48, 0]}>
            {!a.cage && <Block size={[0.46, 0.42, 0.48]} radius={0.035} position={[-0.65, -0.19, 0]} />}
            <Block
              size={[0.31, 0.49, 0.33]}
              radius={0.055}
              position={[-0.65, 0.22, 0]}
            />
            <Block
              size={[1.7, 0.27, 0.38]}
              radius={0.11}
              position={[0, 0.52, 0]}
              color="#383d37"
              roughness={0.7}
            />
            {Array.from({ length: 9 }, (_, i) => (
              <Block
                key={i}
                size={[0.026, 0.285, 0.385]}
                radius={0.01}
                position={[-0.22 + i * 0.105, 0.52, 0]}
                color="#191f19"
              />
            ))}
            <Screw position={[-0.65, 0.2, 0.174]} />
          </group>
        )}
        {a.sideHandle && (
          <group name="SideHandle" position={attachmentPoints.rightMount}>
            {!a.cage && <Block size={[0.32, 0.48, 0.42]} radius={0.035} position={[-0.16, 0, 0]} />}
            <Block size={[0.49, 0.15, 0.3]} radius={0.035} />
            <Block
              size={[0.4, 1.24, 0.55]}
              radius={0.15}
              position={[0.4, -0.14, 0]}
              color="#785238"
              metalness={0.05}
              roughness={0.65}
            />
            <Screw position={[0.4, 0.23, 0.28]} />
            <Screw position={[0.4, -0.52, 0.28]} />
          </group>
        )}
        {a.flash && (
          <group
            name="Flash"
            position={[a.topHandle ? 0.85 : -0.05, a.cage ? 1.48 : hotY, -0.03]}
          >
            <Block
              size={[0.28, 0.35, 0.31]}
              radius={0.04}
              position={[0, 0.17, 0]}
            />
            <Block
              size={[0.52, 0.72, 0.42]}
              radius={0.075}
              position={[0, 0.68, -0.05]}
            />
            <Block
              size={[0.93, 0.47, 0.53]}
              radius={0.09}
              position={[0, 1.2, 0.07]}
            />
            <Block
              size={[0.79, 0.3, 0.016]}
              radius={0.035}
              position={[0, 1.2, 0.34]}
              color="#d5ddd0"
              roughness={0.22}
            />
            {Array.from({ length: 10 }, (_, i) => (
              <Block
                key={i}
                size={[0.014, 0.27, 0.02]}
                radius={0.003}
                position={[-0.34 + i * 0.075, 1.2, 0.355]}
                color="#9da69a"
              />
            ))}
            <Label
              text="N 40"
              position={[0, 0.65, 0.169]}
              width={0.28}
              height={0.08}
            />
          </group>
        )}
        {a.microphone && (
          <group
            name="Microphone"
            position={[
              a.flash || a.topHandle ? -1.25 : 0,
              a.cage ? 1.48 : hotY,
              0,
            ]}
          >
            <Block
              size={[0.21, 0.29, 0.27]}
              radius={0.025}
              position={[0, 0.14, 0]}
            />
            {(a.flash || a.topHandle) && (
              <Block
                size={[1.25, 0.065, 0.15]}
                radius={0.018}
                position={[0.625, 0.005, 0]}
              />
            )}
            <Ring
              radius={0.22}
              tube={0.028}
              position={[0, 0.43, 0.1]}
              color="#585e54"
            />
            <Cylinder
              radius={0.145}
              length={1.55}
              position={[0, 0.44, 0.23]}
              color="#242d26"
            />
            <Knurl
              radius={0.15}
              length={0.82}
              position={[0, 0.44, 0.54]}
              count={48}
            />
            <Cylinder
              radius={0.164}
              length={0.1}
              position={[0, 0.44, 1.04]}
              color="#434f43"
              roughness={1}
            />
          </group>
        )}
        {a.monitor && (
          <group position={[-1.64, 0.6, -0.1]} name="Monitor">
            <Block
              size={[0.11, 0.9, 0.12]}
              radius={0.025}
              position={[-0.15, 0.39, 0]}
              rotation={[0, 0, -0.34]}
            />
            <Block
              size={[1.72, 1.12, 0.12]}
              radius={0.055}
              position={[-0.52, 1.06, 0]}
            />
            <Block
              size={[1.52, 0.88, 0.015]}
              radius={0.02}
              position={[-0.52, 1.08, -0.07]}
              color="#344c42"
            />
            <Label
              text="NOVA / 4K REC"
              position={[-0.52, 1.37, -0.08]}
              rotation={[0, Math.PI, 0]}
              width={1.25}
              height={0.09}
            />
          </group>
        )}
      </group>
      {a.batteryGrip && (
        <group name="BatteryGrip" position={[0, explode ? -1.86 : -1.22, 0]}>
          <Block
            size={[3.01, 0.49, 0.9]}
            radius={0.13}
            color="#252b26"
            roughness={0.8}
          />
          <Block
            size={[0.7, 0.51, 1.08]}
            radius={0.14}
            position={[1.13, 0, 0.11]}
            color="#1a201b"
            roughness={0.85}
          />
          <Label
            text="NOVA / POWER MODULE"
            position={[-0.3, 0, 0.457]}
            width={1.3}
            height={0.09}
          />
          <Cylinder
            radius={0.08}
            length={0.035}
            position={[1.21, 0, 0.668]}
            color="#687562"
          />
        </group>
      )}
      {a.strap && (
        <group name="Strap">
          <Strap />
        </group>
      )}
      {a.rails && (
        <group position={[0, a.batteryGrip ? -1.68 : -1.19, 0.4]} name="Rails">
          <Block size={[1.62, 0.2, 0.73]} radius={0.055} />
          {[-0.55, 0.55].map((x) => (
            <Cylinder
              key={x}
              radius={0.083}
              length={3.4}
              position={[x, -0.15, 0.3]}
              color="#424c48"
            />
          ))}
        </group>
      )}
    </group>
  );
}
