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
function Prism({ nikon, color, roughness }: { nikon: boolean; color: string; roughness: number }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    if (nikon) {
      shape.moveTo(-.69, 0); shape.lineTo(.69, 0);
      shape.quadraticCurveTo(.72, .15, .57, .38);
      shape.quadraticCurveTo(.43, .70, .28, .72);
      shape.lineTo(-.28, .72); shape.quadraticCurveTo(-.43, .70, -.57, .38);
      shape.quadraticCurveTo(-.72, .15, -.69, 0);
    } else {
      shape.moveTo(-.61, 0); shape.lineTo(.61, 0); shape.lineTo(.37, .51); shape.lineTo(-.37, .51); shape.closePath();
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: nikon ? .93 : .72, bevelEnabled: true, bevelSegments: nikon ? 5 : 2, steps: 1, bevelSize: nikon ? .075 : .018, bevelThickness: nikon ? .075 : .018, curveSegments: 16 });
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - (nikon ? .5 : .38) - Math.max(0, p.getY(i)) * (nikon ? .36 : .30));
    g.computeVertexNormals();
    return g;
  }, [nikon]);
  const bump = useMemo(() => surfaceTexture("rubber"), []);
  useEffect(() => () => { geometry.dispose(); }, [geometry]);
  useEffect(() => () => bump.dispose(), [bump]);
  return <mesh geometry={geometry} position={[-.22, .84, .1]} castShadow receiveShadow><meshStandardMaterial color={color} metalness={.22} roughness={roughness} bumpMap={bump} bumpScale={.004} /></mesh>;
}

function Dial({ position, radius = .27, labels, double = false }: { position: V3; radius?: number; labels: string[]; double?: boolean }) {
  return <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <Cylinder radius={radius + .018} length={double ? .2 : .12} color="#111314" />
    <Knurl radius={radius + .02} length={double ? .18 : .105} count={64} color="#4b4c4c" />
    {double && <Ring radius={radius + .025} tube={.008} color="#0a0a0a" />}
    <Cylinder radius={radius} length={.015} position={[0, 0, double ? .11 : .07]} color="#242626" roughness={.65} metalness={.25} />
    {labels.map((label, i) => {
      const a = i / labels.length * Math.PI * 2;
      return <Label key={i} text={label} width={.075} height={.048} position={[Math.sin(a) * radius * .73, Math.cos(a) * radius * .73, double ? .12 : .08]} rotation={[0, 0, -a]} color={label === "AUTO" ? "#86b580" : "#e2e1db"} />;
    })}
    <Cylinder radius={.048} length={.02} position={[0, 0, double ? .12 : .08]} color="#161819" />
  </group>;
}

function Hotshoe({ y }: { y: number }) {
  return <group position={[-.22, y, -.13]}>
    <Block size={[.42, .045, .4]} radius={.012} color="#0d1011" />
    {[-.2, .2].map(x => <Block key={x} size={[.05, .06, .42]} radius={.008} color="#959b9e" position={[x, .025, 0]} />)}
    <Block size={[.31, .012, .25]} radius={.006} color="#888b8d" position={[0, .028, -.025]} />
    {[-.09, 0, .09].map(x => <Cylinder key={x} radius={.015} length={.008} color="#c1a365" rotation={[0, 0, 0]} position={[x, .04, .12]} />)}
  </group>;
}

function Rear({ nikon }: { nikon: boolean }) {
  const c = useCamera(s => s.config), select = useCamera(s => s.select);
  const z = nikon ? -.65 : -.48;
  return <group name="Rear controls" position={[0, 0, z]}>
    <Block size={[3.08, 1.65, .055]} radius={.1} color={c.color} roughness={.8} surface="rubber" />
    <group name="RearDisplay" position={[-1.27, -.05, -.08]} rotation={[0, c.screen === "Articulated" ? .85 : 0, 0]} onClick={e => { e.stopPropagation(); select("View"); }}>
      <Block size={[1.98, 1.26, .12]} radius={.055} color="#111315" position={[.97, 0, 0]} />
      <Block size={[1.8, 1.04, .015]} radius={.025} position={[.97, .035, -.07]} color={c.sensor === "Monochrome" ? "#313535" : "#263e42"} roughness={.2} />
      <Label text={`${bodyBrands[c.body]} / LIVE VIEW`} position={[.97, .36, -.08]} rotation={[0, Math.PI, 0]} width={1.4} height={.075} color="#c9d9d6" />
      <Label text={`1/250   F${lenses.find(l => l.id === c.lens)?.aperture}   ISO 200`} position={[.97, -.34, -.08]} rotation={[0, Math.PI, 0]} width={1.5} height={.07} />
      <Label text={bodyBrands[c.body]} position={[.97, -.55, -.08]} rotation={[0, Math.PI, 0]} width={.48} height={.05} />
      <Ring radius={.17} tube={.006} position={[.97, .02, -.085]} color="#a6c9b6" />
    </group>
    <group position={[1.07, -.22, -.095]} rotation={[0, Math.PI, 0]}>
      <Cylinder radius={.25} length={.06} color="#101213" />
      <Knurl radius={.25} length={.055} count={48} />
      <Cylinder radius={.105} length={.08} color="#272b2c" />
      <Label text={nikon ? "OK" : "MENU"} position={[0, 0, .045]} width={.15} height={.05} />
      {[0, 1, 2, 3].map(i => <Label key={i} text="•" position={[Math.cos(i * Math.PI / 2) * .18, Math.sin(i * Math.PI / 2) * .18, .035]} width={.045} height={.04} />)}
    </group>
    {[[.88, .39], [1.35, .39], [.92, -.66], [1.4, -.66]].map(([x, y], i) => <group key={i} position={[x, y, -.09]} rotation={[0, Math.PI, 0]}>
      <Cylinder radius={.075} length={.045} color="#171a1b" /><Label text={["AF-L", "Q", "DISP", "▶"][i]} width={.12} height={.048} position={[0, 0, .029]} />
    </group>)}
    <Block size={[.46, .22, .19]} radius={.07} position={[1.15, .7, -.09]} color="#17191a" surface="rubber" />
    <group position={[1.05, .74, -.2]} rotation={[Math.PI / 2, 0, 0]}><Cylinder radius={.19} length={.1} /><Knurl radius={.193} length={.09} count={40} /></group>
    {nikon && [-.49, -.16, .17, .5].map((y, i) => <group key={y} position={[-1.44, y, -.08]} rotation={[0, Math.PI, 0]}><Cylinder radius={.065} length={.04} /><Label text={["−", "+", "WB", "MENU"][i]} width={.105} height={.045} position={[0, 0, .026]} /></group>)}
  </group>;
}

export function ReferenceBody({ explode }: { explode: boolean }) {
  const c = useCamera(s => s.config), select = useCamera(s => s.select);
  const nikon = c.body === "D7500";
  const ink = markingColor(c.color);
  const grip = useRef<THREE.Group>(null), rear = useRef<THREE.Group>(null);
  const finish = c.finish === "Matte" ? .67 : c.finish === "Brushed" ? .32 : .42;
  const gripSurface = c.grip === "Walnut" ? "walnut" : c.grip === "Leather" ? "leather" : "rubber";
  const gripColor = c.grip === "Walnut" ? "#634331" : c.grip === "Leather" ? "#49392e" : "#121415";
  const gripInk = markingColor(gripColor);
  const roof = nikon ? 1.68 : 1.39;
  useFrame((_, dt) => {
    if (grip.current) grip.current.position.x = motionDamp(grip.current.position.x, explode ? .8 : 0, 6, dt);
    if (rear.current) rear.current.position.z = motionDamp(rear.current.position.z, explode ? -.75 : 0, 6, dt);
  });
  return <group name={nikon ? "Nikon D7500 body" : "Fujifilm X-T50 body"} onClick={e => { e.stopPropagation(); select("Body"); }}>
    <Block size={[3.2, nikon ? 2.08 : 1.86, nikon ? 1.15 : .83]} radius={nikon ? .24 : .11} position={[0, nikon ? -.06 : 0, nikon ? -.035 : 0]} color={c.color} roughness={finish} surface={c.finish === "Brushed" ? "brushed" : "rubber"} metalness={.2} />
    <Block size={[3.13, nikon ? 1.5 : 1.31, .085]} radius={.07} position={[0, -.16, nikon ? .551 : .422]} color={gripColor} surface={gripSurface} metalness={0} roughness={.95} />
    <Block size={[3.17, .11, nikon ? 1.09 : .85]} radius={.025} position={[0, nikon ? -1.07 : -.895, -.015]} color="#111314" roughness={.5} />
    <Block size={[3.16, nikon ? .44 : .43, nikon ? 1.08 : .85]} radius={nikon ? .18 : .065} position={[0, .745, -.02]} color={c.color} roughness={finish} metalness={.2} />
    {/* Fuji's shallow thumb grip and Nikon's deep rounded handgrip have different silhouettes. */}
    <group ref={grip} name="Handgrip" onClick={e => { e.stopPropagation(); select("Handling"); }}>
      <Block size={[nikon ? .88 : .59, nikon ? 1.93 : 1.62, nikon ? 1.63 : .98]} radius={nikon ? .3 : .19} position={[nikon ? 1.24 : 1.28, -.09, nikon ? .28 : .105]} color={gripColor} roughness={.94} metalness={0} surface={gripSurface} />
      <Block size={[nikon ? .83 : .62, nikon ? .38 : .43, nikon ? 1.22 : .75]} radius={nikon ? .18 : .1} position={[1.27, nikon ? .73 : .745, nikon ? .47 : .18]} color={c.color} roughness={finish} metalness={.22} />
      {nikon && <Block size={[.66, .045, .055]} radius={.021} position={[1.27, .48, 1.055]} rotation={[0, 0, -.06]} color="#b3202c" metalness={.18} roughness={.4} />}
      <group position={[1.28, .65, nikon ? 1.02 : .57]} rotation={[-Math.PI / 2, 0, 0]}><Cylinder radius={.17} length={.09} color="#111314" /><Knurl radius={.173} length={.08} count={40} /></group>
      <group position={[1.25, .955, nikon ? .71 : .3]} rotation={[-Math.PI / 2, 0, 0]}>
        <Cylinder radius={.18} length={.055} color="#080a0b" /><Ring radius={.16} tube={.009} color="#73787a" position={[0, 0, .031]} /><Cylinder radius={.113} length={.075} color={nikon ? "#33383b" : "#929594"} />
        <Block size={[.05, .1, .025]} radius={.012} position={[.16, -.06, .04]} color="#131516" />
      </group>
      <Label text="ON  OFF" position={[nikon ? 1.28 : 1.27, nikon ? .925 : .969, nikon ? .94 : -.03]} rotation={[-Math.PI / 2, 0, 0]} width={nikon ? .29 : .18} height={.055} color={ink} />
    </group>
    {nikon ? <>
      <Dial position={[-1.30, 1.02, -.03]} radius={.265} double labels={["AUTO", "P", "S", "A", "M", "U1", "U2", "SCENE"]} />
      <Block size={[.68, .025, .38]} radius={.035} position={[.84, .97, -.17]} color="#696e60" metalness={.25} roughness={.25} />
      <Label text="125  F5.6" position={[.84, .989, -.17]} rotation={[-Math.PI / 2, 0, 0]} width={.56} height={.14} color="#202b28" />
      <Label text="D7500" position={[-1.15, .38, .603]} width={.41} height={.12} color={gripInk} />
      {[.19, -.1].map((y, i) => <group key={y} position={[-1.31, y, .615]}><Cylinder radius={.065} length={.035} /><Label text={i ? "BKT" : "⚡"} width={.09} height={.055} position={[0, 0, .025]} /></group>)}
    </> : <>
      <Dial position={[-1.13, 1.0, -.035]} radius={.27} labels={["+3", "+2", "+1", "0", "−1", "−2", "−3"]} />
      <Dial position={[.77, 1.0, -.08]} radius={.285} labels={["A", "B", "30", "60", "125", "250", "500", "1000"]} />
      <Label text="X-T50" position={[-1.15, .72, .416]} width={.49} height={.115} color={ink} />
      <Cylinder radius={.062} length={.022} position={[.53, .72, .425]} color="#a0a448" metalness={.1} />
      <Ring radius={.072} tube={.013} position={[.53, .72, .443]} color="#101314" />
      <group position={[-1.17, -.55, .5]}>
        <Cylinder radius={.16} length={.055} color="#0c0e0f" /><Knurl radius={.162} length={.05} count={32} />
        <Cylinder radius={.115} length={.065} color="#252728" />
        <Label text="M C S" position={[0, .121, .033]} width={.19} height={.04} />
        <Block size={[.018, .07, .01]} radius={.003} position={[0, .06, .039]} color="#ddddda" />
      </group>
    </>}
    <group name="Viewfinder" onClick={e => { e.stopPropagation(); select("View"); }}>
      {c.viewfinder !== "None" && <>
        <Prism nikon={nikon} color={c.color} roughness={finish} />
        {nikon ? <>
          <Block size={[1.06, .25, .06]} radius={.045} position={[-.22, 1.02, .56]} rotation={[-.21, 0, 0]} color="#181a1b" roughness={.65} />
          <Label text="Nikon" font="Arial, sans-serif" weight={800} position={[-.22, 1.025, .596]} rotation={[-.21, 0, 0]} width={.83} height={.23} color="#efefeb" />
        </> : <Label text="FUJIFILM" weight={800} position={[-.22, .94, .435]} rotation={[-Math.atan(.3), 0, 0]} width={.92} height={.18} color={ink} />}
        <Block size={[.75, c.viewfinder === "Cinema" ? .6 : .42, .3]} radius={.09} position={[-.22, 1.07, nikon ? -.68 : -.47]} color="#0e1112" metalness={0} roughness={.95} />
        <Block size={[.47, .23, .035]} radius={.045} position={[-.22, 1.09, nikon ? -.84 : -.63]} color="#162c30" roughness={.13} metalness={.65} />
        <Cylinder radius={.085} length={.06} position={[.24, 1.08, nikon ? -.7 : -.51]} rotation={[0, 0, Math.PI / 2]} color="#171a1b" />
      </>}
      {c.viewfinder === "None" && <Label text={bodyBrands[c.body]} position={[-.22, nikon ? .984 : .969, .27]} rotation={[-Math.PI / 2, 0, 0]} width={.7} height={.095} color={ink} />}
      <Hotshoe y={c.viewfinder === "None" ? 1 : roof} />
    </group>
    <group ref={rear}><Rear nikon={nikon} /></group>
    <Cylinder radius={.105} length={.07} position={[.69, -.54, nikon ? .64 : .49]} color="#121415" />
    <Label text={c.engraving.toUpperCase()} position={[-1.20, nikon ? -.75 : -.79, nikon ? .6 : .47]} width={.50} height={.065} color={gripInk} />
    {[-1.63, 1.63].map(x => <group key={x} position={[x, .57, 0]}>
      <Block size={[.15, .19, .12]} radius={.035} color="#666b6c" metalness={.8} />
      <Ring radius={.075} tube={.022} position={[x > 0 ? .035 : -.035, 0, .07]} color="#a4a9aa" />
    </group>)}
    <group position={[-1.609, -.15, -.08]} rotation={[0, -Math.PI / 2, 0]}>
      <Block size={[nikon ? .72 : .5, 1.05, .035]} radius={.055} color="#16191a" roughness={.94} />
      <Label text="MIC  HDMI" position={[0, .26, .023]} width={.38} height={.07} color="#6e7576" />
      <Block size={[.32, .016, .009]} radius={.003} position={[0, 0, .022]} color="#050809" />
      <Label text="USB" position={[0, -.24, .023]} width={.21} height={.07} color="#6e7576" />
    </group>
    {[-1.45, 1.45].map(x => <Screw key={x} position={[x, nikon ? -.97 : -.78, nikon ? .51 : .425]} />)}
    <group position={[0, nikon ? -1.139 : -.958, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <Cylinder radius={.11} length={.015} color="#a1a4a5" /><Cylinder radius={.055} length={.023} color="#090b0c" />
      <Label text={`${bodyBrands[c.body]} / ${bodyNames[c.body]}`} position={[-.75, 0, .013]} width={.95} height={.08} />
    </group>
  </group>;
}
