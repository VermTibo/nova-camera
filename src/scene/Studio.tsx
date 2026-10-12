import { motionDamp } from "./motion";
import { nearestOrbitAngle, viewPositions as positions } from "./orbitMotion";
import { fitBoxDistance, viewerFrame } from "./framing";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  Grid,
  Edges,
} from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { CameraBody } from "./CameraBody";
import { Lens } from "./Lens";
import { Diagnostics } from "./Diagnostics";
import { Accessories } from "./Accessories";
import { useCamera } from "../state/cameraStore";
import { lightingLooks, useStudio } from "../state/studioStore";
import { lenses } from "../data/catalog";
function Rig({ product }: { product: RefObject<THREE.Group | null> }) {
  const rotating = useStudio(s => s.rotating);
  const speed = useStudio(s => s.speed);
  const { camera, size, gl } = useThree();
  const controls = useMemo(() => new OrbitControlsImpl(camera), [camera]);
  const config = useCamera((s) => s.config);
  const mode = useCamera((s) => s.mode);
  const view = useCamera((s) => s.view);
  const tick = useCamera((s) => s.viewTick);
  const moving = useRef(true);
  const settling = useRef(2);
  const bounds = useRef(new THREE.Box3());
  const center = useRef(new THREE.Vector3());
  const extent = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3(...positions.Hero).normalize());
  const currentOrbit = useRef(new THREE.Spherical());
  const targetOrbit = useRef(new THREE.Spherical());
  const safeDistance = useRef(9);
  const offset = useRef(new THREE.Vector3());

  useEffect(() => {
    controls.connect(gl.domElement);
    controls.enablePan = false;
    controls.dampingFactor = .08;
    controls.maxPolarAngle = Math.PI * .94;
    const interrupt = () => { moving.current = false; };
    controls.addEventListener("start", interrupt);
    return () => {
      controls.removeEventListener("start", interrupt);
      controls.dispose();
    };
  }, [controls, gl]);

  useEffect(() => {
    // Drain drag momentum once before starting a preset transition.
    controls.autoRotate = false;
    controls.enableDamping = false;
    controls.update();
    direction.current.set(...positions[view]).normalize();
    moving.current = true;
    settling.current = 2;
  }, [view, tick, controls]);
  useEffect(() => {
    // Measure throughout assembly/lens animations, then keep the stable bounds.
    settling.current = 2;
  }, [config, mode, size.width, size.height]);
  useEffect(() => {
    if (!moving.current && controls) {
      direction.current.copy(camera.position).sub(controls.target).normalize();
    }
    moving.current = true;
  }, [camera, config.lens, config.accessories, mode, size.width, size.height]);

  useFrame((_, dt) => {
    const orbit = controls;
    const model = product.current;
    if (!orbit || !model || !(camera instanceof THREE.PerspectiveCamera)) return;
    if (settling.current > 0) {
      model.updateWorldMatrix(true, true);
      bounds.current.setFromObject(model);
      if (!bounds.current.isEmpty()) {
        bounds.current.getCenter(center.current);
        bounds.current.getSize(extent.current);
      }
      settling.current -= Math.min(dt, .1);
    }
    // Centre on the actual model; panning cannot move it outside the viewport.
    orbit.target.copy(center.current);
    offset.current.copy(camera.position).sub(orbit.target).normalize();
    const aspect = size.width / Math.max(size.height, 1);
    const frame = viewerFrame(size.width, size.height);
    safeDistance.current = fitBoxDistance(extent.current.toArray(), offset.current.toArray(), camera.fov, aspect, 1.1, frame);
    orbit.minDistance = safeDistance.current;
    orbit.maxDistance = Math.max(24, safeDistance.current * 2.5);
    orbit.enableDamping = !moving.current;
    if (moving.current) {
      const fitted = fitBoxDistance(extent.current.toArray(), direction.current.toArray(), camera.fov, aspect, 1.1, frame);
      const current = currentOrbit.current.setFromVector3(offset.current.copy(camera.position).sub(orbit.target));
      const target = targetOrbit.current.setFromVector3(direction.current);
      target.theta = nearestOrbitAngle(current.theta, target.theta);
      target.radius = Math.max(orbit.minDistance, fitted * (view === "Detail" ? 1 : 1.04));
      // Travel around the subject, never through it, including a full front/back flip.
      current.theta = motionDamp(current.theta, target.theta, 5, Math.min(dt, .05));
      current.phi = motionDamp(current.phi, target.phi, 5, Math.min(dt, .05));
      current.radius = motionDamp(current.radius, target.radius, 5, Math.min(dt, .05));
      current.makeSafe();
      camera.position.setFromSpherical(current).add(orbit.target);
      if (Math.abs(current.theta - target.theta) < .001 && Math.abs(current.phi - target.phi) < .001 && Math.abs(current.radius - target.radius) < .01 && settling.current <= 0) moving.current = false;
    }
    orbit.autoRotateSpeed = speed;
    orbit.autoRotate = (rotating || mode === "Cinematic") && !moving.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    orbit.update();
    // Orbit damping changes the angle: recompute the fit AFTER controls update.
    offset.current.copy(camera.position).sub(orbit.target);
    orbit.minDistance = fitBoxDistance(extent.current.toArray(), offset.current.toArray(), camera.fov, aspect, 1.1, frame);
    if (offset.current.length() < orbit.minDistance) {
      if (offset.current.lengthSq() < .0001) offset.current.copy(direction.current);
      camera.position.copy(offset.current.setLength(orbit.minDistance)).add(orbit.target);
      camera.lookAt(orbit.target);
    }
  });
  return null;
}
function Product({ root }: { root: RefObject<THREE.Group | null> }) {
  const mode = useCamera((s) => s.mode);
  const ready = useCamera((s) => s.setReady);
  const config = useCamera((s) => s.config);
  const elapsed = useRef(0);
  useEffect(() => ready(), [ready]);
  useFrame((_, dt) => {
    elapsed.current += dt;
    if (root.current) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      root.current.position.y = reduced
        ? 0
        : motionDamp(root.current.position.y, 0, 4, dt);
      root.current.rotation.y = reduced
        ? 0
        : motionDamp(root.current.rotation.y, 0, 4, dt);
    }
  });
  return (
    <group ref={root} position={[0, -0.2, 0]} rotation={[0, -0.13, 0]} scale={[-1, 1, 1]}>
      <CameraBody explode={mode === "Exploded"} />
      <Lens explode={mode === "Exploded"} />
      <Accessories explode={mode === "Exploded"} />
      {mode === "Technical" && (
        <>
          <mesh position={[0, 0, 0.9]}>
            <boxGeometry
              args={[
                3.55,
                2.5,
                (lenses.find((l) => l.id === config.lens)?.length || 1.5) + 1.5,
              ]}
            />
            <meshBasicMaterial visible={false} />
            <Edges color="#3478f7" />
          </mesh>
        </>
      )}
    </group>
  );
}
function ContextGuard() {
  const gl = useThree((s) => s.gl);
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const onLost = (e: Event) => {
      e.preventDefault();
      setLost(true);
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    return () => gl.domElement.removeEventListener("webglcontextlost", onLost);
  }, [gl]);
  if (lost) throw new Error("Graphics context lost");
  return null;
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <span>NOVA / SYSTEM</span>
        <h2>3D experience unavailable.</h2>
        <p>
          Enable hardware acceleration or reload to reconnect to your graphics
          device. Your configuration controls remain available.
        </p>
        <button onClick={() => window.location.reload()}>
          Reload experience
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Studio({ paused = false }: { paused?: boolean }) {
  const { look, brightness } = useStudio();
  const lighting = lightingLooks[look];
  const product = useRef<THREE.Group>(null);
  const mode = useCamera((s) => s.mode);
  return (
    <SceneBoundary>
      <Canvas
        frameloop={paused ? "never" : "always"}
        shadows
        dpr={[1, 2]}
        camera={{ position: positions.Hero, fov: 37, near: 0.1, far: 250 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.18;
        }}
      >
        <ContextGuard />
        {mode === "Detail" && <color attach="background" args={["#000000"]} />}
        {new URLSearchParams(window.location.search).get("debug") ===
          "true" && <Diagnostics />}
        <ambientLight intensity={lighting.ambient * brightness} />
        <directionalLight
          position={[3, 7, 5]}
          intensity={3.2 * brightness}
          color={lighting.key}
        />
        <directionalLight
          position={[-4, 2, 2]}
          intensity={1.4 * brightness}
          color={lighting.fill}
        />
        <directionalLight
          position={[-2, 3, -6]}
          intensity={2 * brightness}
          color={lighting.rim}
        />
        <spotLight
          position={[1, 5, -4]}
          intensity={35 * brightness}
          angle={0.6}
          penumbra={1}
          color={lighting.rim}
        />
        <Suspense fallback={null}>
          <Environment key={look} environmentIntensity={brightness} resolution={512}>
            <Lightformer
              form="rect"
              intensity={4}
              color={lighting.key}
              position={[0, 5, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[8, 5, 1]}
            />
            <Lightformer
              form="rect"
              intensity={3}
              color={lighting.fill}
              position={[-5, 1, 3]}
              rotation={[0, Math.PI / 2, 0]}
              scale={[3, 6, 1]}
            />
            <Lightformer
              form="rect"
              intensity={5}
              color={lighting.rim}
              position={[4, 2, -3]}
              rotation={[0, -Math.PI / 3, 0]}
              scale={[2, 5, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.5}
              position={[0, 0, 5]}
              scale={[5, 0.8, 1]}
            />
          </Environment>
          <Product root={product} />
          <ContactShadows
            position={[0, -2.65, 0]}
            opacity={0.2}
            scale={16}
            blur={2.8}
            far={7}
            resolution={512}
            frames={Infinity}
          />
          {mode === "Technical" && (
            <Grid
              position={[0, -2.5, 0]}
              args={[14, 14]}
              cellSize={0.5}
              sectionSize={2}
              cellColor="#243a66"
              sectionColor="#3478f7"
              fadeDistance={17}
              infiniteGrid
            />
          )}
          <Rig product={product} />

        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
