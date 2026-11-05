import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCamera } from "../state/cameraStore";
import { bodyBrands, bodyNames, lenses } from "../data/catalog";
import { Block, Cylinder, Knurl, Label, Ring, Screw, type V3 } from "./Parts";
import { markingColor } from "./materialColors";
import { motionDamp } from "./motion";
import { surfaceTexture } from "./surfaces";

/** Beveled, tapered prism shells: the Fuji roof is angular; Nikon's is sculpted. */
function Prism({
  nikon,
  color,
  roughness,
}: {
  nikon: boolean;
  color: string;
  roughness: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    if (nikon) {
      shape.moveTo(-0.69, 0);
      shape.lineTo(0.69, 0);
      shape.quadraticCurveTo(0.72, 0.15, 0.57, 0.38);
      shape.quadraticCurveTo(0.43, 0.7, 0.28, 0.72);
      shape.lineTo(-0.28, 0.72);
      shape.quadraticCurveTo(-0.43, 0.7, -0.57, 0.38);
      shape.quadraticCurveTo(-0.72, 0.15, -0.69, 0);
    } else {
      shape.moveTo(-0.61, 0);
      shape.lineTo(0.61, 0);
      shape.lineTo(0.37, 0.51);
      shape.lineTo(-0.37, 0.51);
      shape.closePath();
    }
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: nikon ? 0.93 : 0.72,
      bevelEnabled: true,
      bevelSegments: nikon ? 5 : 2,
      steps: 1,
      bevelSize: nikon ? 0.075 : 0.018,
      bevelThickness: nikon ? 0.075 : 0.018,
      curveSegments: 16,
    });
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(
        i,
        p.getZ(i) -
          (nikon ? 0.5 : 0.38) -
          Math.max(0, p.getY(i)) * (nikon ? 0.36 : 0.3),
      );
    g.computeVertexNormals();
    return g;
  }, [nikon]);
  const bump = useMemo(() => surfaceTexture("rubber"), []);
  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );
  useEffect(() => () => bump.dispose(), [bump]);
  return (
    <mesh
      geometry={geometry}
      position={[-0.22, 0.84, 0.1]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={0.22}
        roughness={roughness}
        bumpMap={bump}
        bumpScale={0.004}
      />
    </mesh>
  );
}

function Dial({
  position,
  radius = 0.27,
  labels,
  double = false,
}: {
  position: V3;
  radius?: number;
  labels: string[];
  double?: boolean;
}) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <Cylinder
        radius={radius + 0.018}
        length={double ? 0.2 : 0.12}
        color="#111314"
      />
      <Knurl
        radius={radius + 0.02}
        length={double ? 0.18 : 0.105}
        count={64}
        color="#4b4c4c"
      />
      {double && <Ring radius={radius + 0.025} tube={0.008} color="#0a0a0a" />}
      <Cylinder
        radius={radius}
        length={0.015}
        position={[0, 0, double ? 0.11 : 0.07]}
        color="#242626"
        roughness={0.65}
        metalness={0.25}
      />
      {labels.map((label, i) => {
        const a = (i / labels.length) * Math.PI * 2;
        return (
          <Label
            key={i}
            text={label}
            width={0.075}
            height={0.048}
            position={[
              Math.sin(a) * radius * 0.73,
              Math.cos(a) * radius * 0.73,
              double ? 0.12 : 0.08,
            ]}
            rotation={[0, 0, -a]}
            color={label === "AUTO" ? "#86b580" : "#e2e1db"}
          />
        );
      })}
      <Cylinder
        radius={0.048}
        length={0.02}
        position={[0, 0, double ? 0.12 : 0.08]}
        color="#161819"
      />
    </group>
  );
}

function Hotshoe({ y }: { y: number }) {
  return (
    <group position={[-0.22, y, -0.13]}>
      <Block size={[0.42, 0.045, 0.4]} radius={0.012} color="#0d1011" />
      {[-0.2, 0.2].map((x) => (
        <Block
          key={x}
          size={[0.05, 0.06, 0.42]}
          radius={0.008}
          color="#959b9e"
          position={[x, 0.025, 0]}
        />
      ))}
      <Block
        size={[0.31, 0.012, 0.25]}
        radius={0.006}
        color="#888b8d"
        position={[0, 0.028, -0.025]}
      />
      {[-0.09, 0, 0.09].map((x) => (
        <Cylinder
          key={x}
          radius={0.015}
          length={0.008}
          color="#c1a365"
          rotation={[0, 0, 0]}
          position={[x, 0.04, 0.12]}
        />
      ))}
    </group>
  );
}

function Rear({ nikon }: { nikon: boolean }) {
  const c = useCamera((s) => s.config),
    select = useCamera((s) => s.select);
  const z = nikon ? -0.65 : -0.48;
  return (
    <group name="Rear controls" position={[0, 0, z]}>
      <Block
        size={[3.08, 1.65, 0.055]}
        radius={0.1}
        color={c.color}
        roughness={0.8}
        surface="rubber"
      />
      <group
        name="RearDisplay"
        position={[-1.27, -0.05, -0.08]}
        rotation={[0, c.screen === "Articulated" ? 0.85 : 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          select("View");
        }}
      >
        <Block
          size={[1.98, 1.26, 0.12]}
          radius={0.055}
          color="#111315"
          position={[0.97, 0, 0]}
        />
        <Block
          size={[1.8, 1.04, 0.015]}
          radius={0.025}
          position={[0.97, 0.035, -0.07]}
          color={c.sensor === "Monochrome" ? "#313535" : "#263e42"}
          roughness={0.2}
        />
        <Label
          text={`${bodyBrands[c.body]} / LIVE VIEW`}
          position={[0.97, 0.36, -0.08]}
          rotation={[0, Math.PI, 0]}
          width={1.4}
          height={0.075}
          color="#c9d9d6"
        />
        <Label
          text={`1/250   F${lenses.find((l) => l.id === c.lens)?.aperture}   ISO 200`}
          position={[0.97, -0.34, -0.08]}
          rotation={[0, Math.PI, 0]}
          width={1.5}
          height={0.07}
        />
        <Label
          text={bodyBrands[c.body]}
          position={[0.97, -0.55, -0.08]}
          rotation={[0, Math.PI, 0]}
          width={0.48}
          height={0.05}
        />
        <Ring
          radius={0.17}
          tube={0.006}
          position={[0.97, 0.02, -0.085]}
          color="#a6c9b6"
        />
      </group>
      <group position={[1.07, -0.22, -0.095]} rotation={[0, Math.PI, 0]}>
        <Cylinder radius={0.25} length={0.06} color="#101213" />
        <Knurl radius={0.25} length={0.055} count={48} />
        <Cylinder radius={0.105} length={0.08} color="#272b2c" />
        <Label
          text={nikon ? "OK" : "MENU"}
          position={[0, 0, 0.045]}
          width={0.15}
          height={0.05}
        />
        {[0, 1, 2, 3].map((i) => (
          <Label
            key={i}
            text="•"
            position={[
              Math.cos((i * Math.PI) / 2) * 0.18,
              Math.sin((i * Math.PI) / 2) * 0.18,
              0.035,
            ]}
            width={0.045}
            height={0.04}
          />
        ))}
      </group>
      {[
        [0.88, 0.39],
        [1.35, 0.39],
        [0.92, -0.66],
        [1.4, -0.66],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, -0.09]} rotation={[0, Math.PI, 0]}>
          <Cylinder radius={0.075} length={0.045} color="#171a1b" />
          <Label
            text={["AF-L", "Q", "DISP", "▶"][i]}
            width={0.12}
            height={0.048}
            position={[0, 0, 0.029]}
          />
        </group>
      ))}
      <Block
        size={[0.46, 0.22, 0.19]}
        radius={0.07}
        position={[1.15, 0.7, -0.09]}
        color="#17191a"
        surface="rubber"
      />
      <group position={[1.05, 0.74, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <Cylinder radius={0.19} length={0.1} />
        <Knurl radius={0.193} length={0.09} count={40} />
      </group>
      {nikon &&
        [-0.49, -0.16, 0.17, 0.5].map((y, i) => (
          <group
            key={y}
            position={[-1.44, y, -0.08]}
            rotation={[0, Math.PI, 0]}
          >
            <Cylinder radius={0.065} length={0.04} />
            <Label
              text={["−", "+", "WB", "MENU"][i]}
              width={0.105}
              height={0.045}
              position={[0, 0, 0.026]}
            />
          </group>
        ))}
    </group>
  );
}

export function ReferenceBody({ explode }: { explode: boolean }) {
  const c = useCamera((s) => s.config),
    select = useCamera((s) => s.select);
  const nikon = c.body === "D7500";
  const ink = markingColor(c.color);
  const grip = useRef<THREE.Group>(null),
    rear = useRef<THREE.Group>(null);
  const finish =
    c.finish === "Matte" ? 0.67 : c.finish === "Brushed" ? 0.32 : 0.42;
  const gripSurface =
    c.grip === "Walnut"
      ? "walnut"
      : c.grip === "Leather"
        ? "leather"
        : "rubber";
  const gripColor =
    c.grip === "Walnut"
      ? "#634331"
      : c.grip === "Leather"
        ? "#49392e"
        : "#121415";
  const gripInk = markingColor(gripColor);
  const roof = nikon ? 1.68 : 1.39;
  useFrame((_, dt) => {
    if (grip.current)
      grip.current.position.x = motionDamp(
        grip.current.position.x,
        explode ? 0.8 : 0,
        6,
        dt,
      );
    if (rear.current)
      rear.current.position.z = motionDamp(
        rear.current.position.z,
        explode ? -0.75 : 0,
        6,
        dt,
      );
  });
  return (
    <group
      name={nikon ? "Nikon D7500 body" : "Fujifilm X-T50 body"}
      onClick={(e) => {
        e.stopPropagation();
        select("Body");
      }}
    >
      <Block
        size={[3.2, nikon ? 2.08 : 1.86, nikon ? 1.15 : 0.83]}
        radius={nikon ? 0.24 : 0.11}
        position={[0, nikon ? -0.06 : 0, nikon ? -0.035 : 0]}
        color={c.color}
        roughness={finish}
        surface={c.finish === "Brushed" ? "brushed" : "rubber"}
        metalness={0.2}
      />
      <Block
        size={[3.13, nikon ? 1.5 : 1.31, 0.085]}
        radius={0.07}
        position={[0, -0.16, nikon ? 0.551 : 0.422]}
        color={gripColor}
        surface={gripSurface}
        metalness={0}
        roughness={0.95}
      />
      <Block
        size={[3.17, 0.11, nikon ? 1.09 : 0.85]}
        radius={0.025}
        position={[0, nikon ? -1.07 : -0.895, -0.015]}
        color="#111314"
        roughness={0.5}
      />
      <Block
        size={[3.16, nikon ? 0.44 : 0.43, nikon ? 1.08 : 0.85]}
        radius={nikon ? 0.18 : 0.065}
        position={[0, 0.745, -0.02]}
        color={c.color}
        roughness={finish}
        metalness={0.2}
      />
      {/* Fuji's shallow thumb grip and Nikon's deep rounded handgrip have different silhouettes. */}
      <group
        ref={grip}
        name="Handgrip"
        onClick={(e) => {
          e.stopPropagation();
          select("Handling");
        }}
      >
        <Block
          size={[nikon ? 0.88 : 0.59, nikon ? 1.93 : 1.62, nikon ? 1.63 : 0.98]}
          radius={nikon ? 0.3 : 0.19}
          position={[nikon ? 1.24 : 1.28, -0.09, nikon ? 0.28 : 0.105]}
          color={gripColor}
          roughness={0.94}
          metalness={0}
          surface={gripSurface}
        />
        <Block
          size={[nikon ? 0.83 : 0.62, nikon ? 0.38 : 0.43, nikon ? 1.22 : 0.75]}
          radius={nikon ? 0.18 : 0.1}
          position={[1.27, nikon ? 0.73 : 0.745, nikon ? 0.47 : 0.18]}
          color={c.color}
          roughness={finish}
          metalness={0.22}
        />
        {nikon && (
          <Block
            size={[0.66, 0.045, 0.055]}
            radius={0.021}
            position={[1.27, 0.48, 1.055]}
            rotation={[0, 0, -0.06]}
            color="#b3202c"
            metalness={0.18}
            roughness={0.4}
          />
        )}
        <group
          position={[1.28, 0.65, nikon ? 1.02 : 0.57]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <Cylinder radius={0.17} length={0.09} color="#111314" />
          <Knurl radius={0.173} length={0.08} count={40} />
        </group>
        <group
          position={[1.25, 0.955, nikon ? 0.71 : 0.3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <Cylinder radius={0.18} length={0.055} color="#080a0b" />
          <Ring
            radius={0.16}
            tube={0.009}
            color="#73787a"
            position={[0, 0, 0.031]}
          />
          <Cylinder
            radius={0.113}
            length={0.075}
            color={nikon ? "#33383b" : "#929594"}
          />
          <Block
            size={[0.05, 0.1, 0.025]}
            radius={0.012}
            position={[0.16, -0.06, 0.04]}
            color="#131516"
          />
        </group>
        <Label
          text="ON  OFF"
          position={[
            nikon ? 1.28 : 1.27,
            nikon ? 0.925 : 0.969,
            nikon ? 0.94 : -0.03,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={nikon ? 0.29 : 0.18}
          height={0.055}
          color={ink}
        />
      </group>
      {nikon ? (
        <>
          <Dial
            position={[-1.3, 1.02, -0.03]}
            radius={0.265}
            double
            labels={["AUTO", "P", "S", "A", "M", "U1", "U2", "SCENE"]}
          />
          <Block
            size={[0.68, 0.025, 0.38]}
            radius={0.035}
            position={[0.84, 0.97, -0.17]}
            color="#696e60"
            metalness={0.25}
            roughness={0.25}
          />
          <Label
            text="125  F5.6"
            position={[0.84, 0.989, -0.17]}
            rotation={[-Math.PI / 2, 0, 0]}
            width={0.56}
            height={0.14}
            color="#202b28"
          />
          <Label
            text="D7500"
            position={[-1.15, 0.38, 0.603]}
            width={0.41}
            height={0.12}
            color={gripInk}
          />
          {[0.19, -0.1].map((y, i) => (
            <group key={y} position={[-1.31, y, 0.615]}>
              <Cylinder radius={0.065} length={0.035} />
              <Label
                text={i ? "BKT" : "⚡"}
                width={0.09}
                height={0.055}
                position={[0, 0, 0.025]}
              />
            </group>
          ))}
        </>
      ) : (
        <>
          <Dial
            position={[-1.13, 1.0, -0.035]}
            radius={0.27}
            labels={["+3", "+2", "+1", "0", "−1", "−2", "−3"]}
          />
          <Dial
            position={[0.77, 1.0, -0.08]}
            radius={0.285}
            labels={["A", "B", "30", "60", "125", "250", "500", "1000"]}
          />
          <Label
            text="X-T50"
            position={[-1.15, 0.72, 0.416]}
            width={0.49}
            height={0.115}
            color={ink}
          />
          <Cylinder
            radius={0.062}
            length={0.022}
            position={[0.53, 0.72, 0.425]}
            color="#a0a448"
            metalness={0.1}
          />
          <Ring
            radius={0.072}
            tube={0.013}
            position={[0.53, 0.72, 0.443]}
            color="#101314"
          />
          <group position={[-1.17, -0.55, 0.5]}>
            <Cylinder radius={0.16} length={0.055} color="#0c0e0f" />
            <Knurl radius={0.162} length={0.05} count={32} />
            <Cylinder radius={0.115} length={0.065} color="#252728" />
            <Label
              text="M C S"
              position={[0, 0.121, 0.033]}
              width={0.19}
              height={0.04}
            />
            <Block
              size={[0.018, 0.07, 0.01]}
              radius={0.003}
              position={[0, 0.06, 0.039]}
              color="#ddddda"
            />
          </group>
        </>
      )}
      <group
        name="Viewfinder"
        onClick={(e) => {
          e.stopPropagation();
          select("View");
        }}
      >
        {c.viewfinder !== "None" && (
          <>
            <Prism nikon={nikon} color={c.color} roughness={finish} />
            {nikon ? (
              <>
                <Block
                  size={[1.06, 0.25, 0.06]}
                  radius={0.045}
                  position={[-0.22, 1.02, 0.56]}
                  rotation={[-0.21, 0, 0]}
                  color="#181a1b"
                  roughness={0.65}
                />
                <Label
                  text="Nikon"
                  font="Arial, sans-serif"
                  weight={800}
                  position={[-0.22, 1.025, 0.596]}
                  rotation={[-0.21, 0, 0]}
                  width={0.83}
                  height={0.23}
                  color="#efefeb"
                />
              </>
            ) : (
              <Label
                text="FUJIFILM"
                weight={800}
                position={[-0.22, 0.94, 0.435]}
                rotation={[-Math.atan(0.3), 0, 0]}
                width={0.92}
                height={0.18}
                color={ink}
              />
            )}
            <Block
              size={[0.75, c.viewfinder === "Cinema" ? 0.6 : 0.42, 0.3]}
              radius={0.09}
              position={[-0.22, 1.07, nikon ? -0.68 : -0.47]}
              color="#0e1112"
              metalness={0}
              roughness={0.95}
            />
            <Block
              size={[0.47, 0.23, 0.035]}
              radius={0.045}
              position={[-0.22, 1.09, nikon ? -0.84 : -0.63]}
              color="#162c30"
              roughness={0.13}
              metalness={0.65}
            />
            <Cylinder
              radius={0.085}
              length={0.06}
              position={[0.24, 1.08, nikon ? -0.7 : -0.51]}
              rotation={[0, 0, Math.PI / 2]}
              color="#171a1b"
            />
          </>
        )}
        {c.viewfinder === "None" && (
          <Label
            text={bodyBrands[c.body]}
            position={[-0.22, nikon ? 0.984 : 0.969, 0.27]}
            rotation={[-Math.PI / 2, 0, 0]}
            width={0.7}
            height={0.095}
            color={ink}
          />
        )}
        <Hotshoe y={c.viewfinder === "None" ? 1 : roof} />
      </group>
      <group ref={rear}>
        <Rear nikon={nikon} />
      </group>
      <Cylinder
        radius={0.105}
        length={0.07}
        position={[0.69, -0.54, nikon ? 0.64 : 0.49]}
        color="#121415"
      />
      <Label
        text={c.engraving.toUpperCase()}
        position={[-1.2, nikon ? -0.75 : -0.79, nikon ? 0.6 : 0.47]}
        width={0.5}
        height={0.065}
        color={gripInk}
      />
      {[-1.63, 1.63].map((x) => (
        <group key={x} position={[x, 0.57, 0]}>
          <Block
            size={[0.15, 0.19, 0.12]}
            radius={0.035}
            color="#666b6c"
            metalness={0.8}
          />
          <Ring
            radius={0.075}
            tube={0.022}
            position={[x > 0 ? 0.035 : -0.035, 0, 0.07]}
            color="#a4a9aa"
          />
        </group>
      ))}
      <group position={[-1.609, -0.15, -0.08]} rotation={[0, -Math.PI / 2, 0]}>
        <Block
          size={[nikon ? 0.72 : 0.5, 1.05, 0.035]}
          radius={0.055}
          color="#16191a"
          roughness={0.94}
        />
        <Label
          text="MIC  HDMI"
          position={[0, 0.26, 0.023]}
          width={0.38}
          height={0.07}
          color="#6e7576"
        />
        <Block
          size={[0.32, 0.016, 0.009]}
          radius={0.003}
          position={[0, 0, 0.022]}
          color="#050809"
        />
        <Label
          text="USB"
          position={[0, -0.24, 0.023]}
          width={0.21}
          height={0.07}
          color="#6e7576"
        />
      </group>
      {[-1.45, 1.45].map((x) => (
        <Screw
          key={x}
          position={[x, nikon ? -0.97 : -0.78, nikon ? 0.51 : 0.425]}
        />
      ))}
      <group
        position={[0, nikon ? -1.139 : -0.958, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <Cylinder radius={0.11} length={0.015} color="#a1a4a5" />
        <Cylinder radius={0.055} length={0.023} color="#090b0c" />
        <Label
          text={`${bodyBrands[c.body]} / ${bodyNames[c.body]}`}
          position={[-0.75, 0, 0.013]}
          width={0.95}
          height={0.08}
        />
      </group>
    </group>
  );
}
