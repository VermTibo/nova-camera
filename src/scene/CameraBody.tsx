import { markingColor } from "./materialColors";
import { motionDamp } from "./motion";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lenses } from "../data/catalog";
import { useCamera } from "../state/cameraStore";
import { Block, Cylinder, Knurl, Label, Ring, Screw } from "./Parts";

function FinderHousing({ color, height, roughness }: { color: string; height: number; roughness: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([
      -0.64, 0, 0.52, 0.64, 0, 0.52, 0.42, height, 0.28, -0.42, height, 0.28,
      -0.64, 0, -0.43, 0.64, 0, -0.43, 0.42, height, -0.43, -0.42, height, -0.43,
    ], 3));
    g.setIndex([0, 1, 2, 0, 2, 3, 1, 5, 6, 1, 6, 2, 5, 4, 7, 5, 7, 6,
      4, 0, 3, 4, 3, 7, 3, 2, 6, 3, 6, 7, 4, 5, 1, 4, 1, 0]);
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    g.dispose();
    return flat;
  }, [height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={[-0.05, 0.91, 0]} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={roughness} metalness={0.28} />
  </mesh>;
}

export function CameraBody({ explode }: { explode: boolean }) {
  const c = useCamera((s) => s.config),
    select = useCamera((s) => s.select);
  const ink = markingColor(c.color);
  const grip = useRef<THREE.Group>(null);
  const rear = useRef<THREE.Group>(null);
  const finish =
    c.finish === "Matte" ? 0.72 : c.finish === "Brushed" ? 0.28 : 0.4;
  useFrame((_, dt) => {
    if (grip.current)
      grip.current.position.x = motionDamp(
        grip.current.position.x,
        explode ? 1 : 0,
        6,
        dt,
      );
    if (rear.current)
      rear.current.position.z = motionDamp(
        rear.current.position.z,
        explode ? -0.65 : 0,
        6,
        dt,
      );
  });
  return (
    <group
      name="Body"
      onClick={(e) => {
        e.stopPropagation();
        select("Body");
      }}
    >
      <Block
        size={[3.22, 1.88, 0.86]}
        radius={0.18}
        color="#131313"
        roughness={0.65}
      />
      <Block
        size={[3.27, 0.44, 0.9]}
        radius={0.09}
        position={[0, 0.79, 0]}
        color={c.color}
        roughness={finish}
        surface={c.finish === "Brushed" ? "brushed" : "rubber"}
      />
      <Block
        size={[3.2, 0.16, 0.89]}
        radius={0.045}
        position={[0, -0.87, 0]}
        color={c.color}
        roughness={finish}
        surface={c.finish === "Brushed" ? "brushed" : undefined}
      />
      <Block
        size={[3.14, 1.37, 0.09]}
        radius={0.12}
        position={[0, -0.05, 0.436]}
        color={c.color}
        roughness={finish}
        surface={c.finish === "Brushed" ? "brushed" : undefined}
      />
      <Block
        size={[0.72, 1.22, 0.04]}
        radius={0.045}
        position={[-1.19, -0.03, 0.497]}
        surface="rubber"
        color={c.color}
        roughness={0.93}
        metalness={0}
      />
      <Block
        size={[3.1, 0.025, 0.025]}
        radius={0.008}
        position={[0, 0.552, 0.46]}
        color="#080a0b"
      />
      <group
        ref={grip}
        name="Grip"
        onClick={(e) => {
          e.stopPropagation();
          select("Handling");
        }}
      >
        <Block
          size={[0.83, 1.82, 1.32]}
          radius={0.26}
          position={[1.30, -0.03, 0.28]}
          surface={
            c.grip === "Walnut"
              ? "walnut"
              : c.grip === "Leather"
                ? "leather"
                : "rubber"
          }
          color={
            c.grip === "Walnut"
              ? "#634331"
              : c.grip === "Leather"
                ? "#49392e"
                : "#151515"
          }
          metalness={0}
          roughness={0.91}
        />
        <Block
          size={[0.7, 0.39, 1.0]}
          radius={0.14}
          position={[1.30, 0.74, 0.42]}
          color={c.color}
          roughness={finish}
          surface={c.finish === "Brushed" ? "brushed" : undefined}
        />
        <group position={[1.3, 0.51, 0.92]} rotation={[-Math.PI / 2, 0, 0]}>
          <Cylinder radius={0.20} length={0.12} color="#252525" />
          <Knurl radius={0.203} length={0.115} count={44} color="#393939" />
        </group>
        <Cylinder
          radius={0.13}
          length={0.035}
          position={[1.30, 0.955, 0.67]}
          rotation={[0, 0, 0]}
          color="#686e6c"
        />
        <Cylinder
          radius={0.095}
          length={0.046}
          position={[1.30, 0.974, 0.67]}
          rotation={[0, 0, 0]}
          color="#141617"
        />
        <Ring
          radius={0.123}
          tube={0.013}
          position={[1.30, 0.981, 0.67]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={c.accent}
        />
      </group>
      <group name="Dials">
        {[
          [0.83, 1.06, -0.18],
          [1.39, 1.06, -0.18],
        ].map((p, i) => (
          <group
            key={i}
            position={p as [number, number, number]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <Cylinder radius={i ? 0.24 : 0.29} length={0.14} color="#222525" />
            <Knurl radius={i ? 0.242 : 0.292} length={0.12} count={56} />
            <Cylinder
              radius={i ? 0.21 : 0.25}
              length={0.012}
              position={[0, 0, 0.076]}
              color={c.color}
            />
            <Label
              text={i ? "−  ·  +" : "M  A  S  P"}
              color={ink}
              position={[0, 0, 0.085]}
              width={i ? 0.30 : 0.38}
              height={0.075}
            />
            <Block
              size={[0.025, 0.065, 0.008]}
              radius={0.003}
              position={[0, 0.17, 0.09]}
              color={c.accent}
            />
          </group>
        ))}
        <Cylinder
          radius={0.063}
          length={0.025}
          rotation={[0, 0, 0]}
          position={[0.53, 1.027, 0.23]}
          color="#702824"
        />
        <Label
          text="REC"
          color={ink}
          position={[0.52, 1.009, 0.38]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={0.19}
          height={0.06}
        />
      </group>
      <group
        name="Viewfinder"
        onClick={(e) => {
          e.stopPropagation();
          select("View");
        }}
      >
        {c.viewfinder !== "None" && (
          <>
            <FinderHousing
              height={c.viewfinder === "Cinema" ? 0.68 : 0.56}
              color={c.color}
              roughness={finish}
            />
            <Label text="SONY" font="Georgia, serif" weight={700}
              position={[-0.05, 1.18, 0.52 - 0.27 * 0.24 / (c.viewfinder === "Cinema" ? 0.68 : 0.56) + 0.003]}
              rotation={[-Math.atan(0.24 / (c.viewfinder === "Cinema" ? 0.68 : 0.56)), 0, 0]}
              width={0.88} height={0.26} color={ink} />
            <Block
              size={[0.83, 0.5, 0.3]}
              radius={0.09}
              position={[-0.05, 1.20, -0.53]}
              color="#191d1c"
              metalness={0}
              roughness={0.8}
            />
            <Block
              size={[0.49, 0.26, 0.025]}
              radius={0.04}
              position={[-0.05, 1.21, -0.688]}
              color="#0b1e23"
              metalness={0.7}
              roughness={0.12}
            />
          </>
        )}
        <Block
          size={[0.37, 0.055, 0.38]}
          radius={0.012}
          position={[
            -0.05,
            c.viewfinder === "None"
              ? 1.025
              : c.viewfinder === "Cinema"
                ? 1.62
                : 1.50,
            -0.03,
          ]}
          color="#202425"
        />
        {[-0.21, 0.11].map((x) => (
          <Block
            key={x}
            size={[0.045, 0.065, 0.39]}
            radius={0.01}
            position={[
              x,
              c.viewfinder === "None"
                ? 1.056
                : c.viewfinder === "Cinema"
                  ? 1.655
                  : 1.535,
              -0.03,
            ]}
            color="#959b99"
          />
        ))}
      </group>
      <Label
        text={c.viewfinder === "None" ? "SONY" : "α"}
        font={c.viewfinder === "None" ? "Georgia, serif" : "Arial, sans-serif"}
        weight={700}
        position={[-1.18, 0.745, 0.453]}
        width={c.viewfinder === "None" ? 0.64 : 0.30}
        height={c.viewfinder === "None" ? 0.22 : 0.36}
        color={ink}
      />
      <Label
        text={c.body === "N1" ? "7 III" : c.body === "N1R" ? "7 R" : "7 C"}
        color={ink}
        position={[-1.19, 0.43, 0.524]}
        width={0.38}
        height={0.11}
      />
      <Label
        text={c.engraving.toUpperCase()}
        position={[-1.18, -0.40, 0.524]}
        width={0.63}
        height={0.095}
        color={ink}
      />
      <Cylinder
        radius={0.037}
        length={0.009}
        position={[-0.69, 0.38, 0.51]}
        color={c.accent}
      />
      <Cylinder
        radius={0.075}
        length={0.034}
        position={[0.67, -0.54, 0.51]}
        color="#222525"
      />
      <group ref={rear} name="RearPlate">
        <Block
          size={[3.08, 1.35, 0.08]}
          radius={0.1}
          position={[0, -0.07, -0.451]}
          color="#202323"
        />
        <group
          position={[-1.32, 0, -0.53]}
          rotation={[0, c.screen === "Articulated" ? -0.8 : 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            select("View");
          }}
        >
          <Block
            size={[2.07, 1.25, 0.1]}
            radius={0.065}
            position={[1, 0, 0]}
            color="#121616"
          />
          <Block
            size={[1.86, 1.045, 0.013]}
            radius={0.02}
            position={[1, 0.035, -0.06]}
            color={c.sensor === "Monochrome" ? "#2e3534" : "#233c3d"}
            roughness={0.2}
          />
          <Label
            text="SONY / LIVE VIEW"
            position={[1, 0.35, -0.072]}
            rotation={[0, Math.PI, 0]}
            width={1.45}
            height={0.1}
            color="#b3cbbd"
          />
          <Label
            text={`1/250     F${lenses.find(lens => lens.id === c.lens)?.aperture}     ISO 100`}
            position={[1, -0.36, -0.072]}
            rotation={[0, Math.PI, 0]}
            width={1.48}
            height={0.075}
          />
          <Ring
            radius={0.16}
            tube={0.006}
            position={[1, 0.02, -0.076]}
            color="#c3d5b9"
          />
          <Label
            text="SONY"
            font="Georgia, serif"
            weight={700}
            position={[1, -0.55, -0.07]}
            rotation={[0, Math.PI, 0]}
            width={0.4}
            height={0.055}
          />
        </group>
        <group position={[1.12, -0.13, -0.53]} rotation={[0, Math.PI, 0]}>
          <Cylinder radius={0.23} length={0.055} />
          <Knurl radius={0.234} length={0.05} count={40} />
          <Cylinder radius={0.105} length={0.065} color="#4a4e4b" />
          <Label
            text="SET"
            position={[0, 0, 0.039]}
            width={0.15}
            height={0.045}
          />
        </group>
        {[
          [0.98, 0.38],
          [1.4, 0.38],
          [0.98, -0.59],
          [1.4, -0.59],
        ].map(([x, y], i) => (
          <group key={i}>
            <Cylinder
              radius={0.07}
              length={0.04}
              position={[x, y, -0.53]}
              color="#343a36"
            />
            <Label
              text={["AF", "AE", "▶", "Q"][i]}
              position={[x, y, -0.56]}
              rotation={[0, Math.PI, 0]}
              width={0.105}
              height={0.048}
            />
          </group>
        ))}
        <Block
          size={[0.46, 0.21, 0.16]}
          radius={0.075}
          position={[1.15, 0.71, -0.51]}
          color="#202524"
        />
      </group>
      {[-1.47, 1.48].flatMap((x) =>
        [-0.71, 0.46].map((y) => (
          <Screw key={`${x}${y}`} position={[x, y, 0.493]} />
        )),
      )}
      {[-1.63, 1.63].map((x) => (
        <group key={x}>
          <Ring
            radius={0.085}
            tube={0.026}
            position={[x, 0.58, 0.02]}
            rotation={[0, Math.PI / 2, 0]}
          />
          <Block
            size={[0.04, 0.42, 0.45]}
            radius={0.025}
            position={[x, -0.14, -0.02]}
            color="#242727"
            roughness={0.8}
          />
        </group>
      ))}
      <Cylinder
        radius={0.115}
        length={0.016}
        position={[0, -0.96, 0]}
        rotation={[0, 0, 0]}
        color="#929693"
      />
      <Cylinder
        radius={0.06}
        length={0.021}
        position={[0, -0.97, 0]}
        rotation={[0, 0, 0]}
        color="#101211"
      />
      <Label
        text="SONY  /  ALPHA CAMERA SYSTEM"
        position={[-0.65, -0.96, 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
        width={1.1}
        height={0.08}
      />
      {c.body === "N1C" &&
        Array.from({ length: 9 }, (_, i) => (
          <Block
            key={i}
            size={[0.22, 0.018, 0.045]}
            radius={0.005}
            position={[-1.66, -0.38 + i * 0.07, 0]}
            rotation={[0, Math.PI / 2, 0]}
            color="#060808"
          />
        ))}
      {c.body === "N1R" && (
        <Label
          text="R"
          position={[-1.2, -0.58, 0.521]}
          width={0.13}
          height={0.09}
          color={c.accent}
        />
      )}
    </group>
  );
}
