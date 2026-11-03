// CPU-only inspection of the actual React Three Fiber scene: no browser or WebGL.
import React from 'react';
import assert from 'node:assert/strict';
import { fitBoxDistance, viewerFrame } from '../src/scene/framing';
import { viewPositions } from '../src/scene/orbitMotion';
import * as THREE from 'three';
import { createRoot, extend, act } from '@react-three/fiber';

Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  window: { navigator: { userAgent: 'Node', platform: 'Node', maxTouchPoints: 0 }, location: { search: '' }, matchMedia: () => ({ matches: true }), devicePixelRatio: 1 },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  document: { createElement: () => ({ width: 1, height: 1, getContext: () => new Proxy({
    measureText: (s: string) => ({ width: s.length * 42, actualBoundingBoxAscent: 60, actualBoundingBoxDescent: 15 }),
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  }, { get: (target, key) => key in target ? target[key as keyof typeof target] : () => {} }) }) },
});
const { CameraBody } = await import('../src/scene/CameraBody');
const { ReferenceBody } = await import('../src/scene/ReferenceBodies');
const { Lens } = await import('../src/scene/Lens');
const { Accessories } = await import('../src/scene/Accessories');
const { useCamera } = await import('../src/state/cameraStore');
const { lenses, accessoryCatalog } = await import('../src/data/catalog');
const { normalize } = await import('../src/state/configuration');
extend(THREE);
const canvas = { width: 1000, height: 800, style: {}, addEventListener() {}, removeEventListener() {} };
const renderer = { render() {}, setSize() {}, setPixelRatio() {}, capabilities: { getMaxAnisotropy: () => 1 } };
const root = createRoot(canvas as unknown as HTMLCanvasElement);
await root.configure({ gl: renderer as unknown as THREE.WebGLRenderer, frameloop: 'never', size: { width: 1000, height: 800, top: 0, left: 0 } });
const issues: string[] = [];
let checkedLabels = 0;
const cases = (['N1', 'XT50', 'D7500'] as const).flatMap(body => [
  ...lenses.map(lens => ({ body, lens: lens.id })),
  { body, hood: true, filter: 'ND' as const, lens: '70-200', mount: 'PL adapter' as const },
  { body, accessories: { flash: true, microphone: true, topHandle: true, monitor: true, rails: true } },
  ...([false, true]).map(explode => ({ body, explode, accessories: Object.fromEntries(Object.keys(accessoryCatalog).map(key => [key, true])) })),
  ...(['None', 'Cinema', 'Standard'] as const).map(viewfinder => ({ body, viewfinder, screen: 'Articulated' as const })),
]);
for (const config of cases) {
  const body = config.body;
  const explode = "explode" in config && config.explode;
  let store: ReturnType<typeof root.render>;
  await act(async () => {
    useCamera.setState({ config: normalize({ ...config, engraving: 'TEST ENGRAVING' }) });
    store = root.render(<group scale={[-1, 1, 1]}>{body === 'N1' ? <CameraBody explode={explode} /> : <ReferenceBody key={body} explode={explode} />}<Lens explode={explode} /><Accessories explode={explode} /></group>);
  });
  const state = store!.getState();
  // Settle animated transforms without rendering anything.
  for (let i = 0; i < 240; i++) for (const sub of state.internal.subscribers) sub.ref.current(state, 1 / 60);
  state.scene.updateMatrixWorld(true);
  const meshes: THREE.Mesh[] = [];
  state.scene.traverse(o => { if (o instanceof THREE.Mesh) meshes.push(o); });
  const solids = meshes.filter(m => !m.name.startsWith('Label:') && !m.name.startsWith('RimLabel:') && !(m.material as THREE.Material).transparent);
  const labels = meshes.filter(m => m.name.startsWith('Label:') && m.name !== 'Label:');
  const context = JSON.stringify(config);
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    assert.ok([...box.min.toArray(), ...box.max.toArray()].every(Number.isFinite), `${context}: finite geometry`);
    if (mesh.userData.shellSize) {
      const size = box.getSize(new THREE.Vector3());
      mesh.userData.shellSize.forEach((expected: number, axis: number) => assert.ok(Math.abs(size.getComponent(axis) - expected) < .001, `${context}: rounded panel exceeds its specified thickness`));
    }
  }
  const display = state.scene.getObjectByName('RearDisplay')!;
  const rearZ = new THREE.Box3().setFromObject(display).max.z;
  assert.ok(rearZ < (body === 'D7500' ? -.61 : body === 'XT50' ? -.415 : -.43), `${context}: screen intersects body`);
  for (const [first, second] of [['Flash', 'TopHandle'], ['Microphone', 'Monitor'], ['BatteryGrip', 'Cage']] as const) {
    const a = state.scene.getObjectByName(first), b = state.scene.getObjectByName(second);
    if (a && b) assert.ok(!new THREE.Box3().setFromObject(a).intersectsBox(new THREE.Box3().setFromObject(b)), `${context}: ${first} intersects ${second}`);
  }
  const extent = new THREE.Box3().setFromObject(state.scene).getSize(new THREE.Vector3()).toArray() as [number, number, number];
  for (const [width, height] of [[390, 620], [900, 528], [1920, 1080]]) for (const direction of Object.values(viewPositions)) {
    const frame = viewerFrame(width, height);
    const camera = new THREE.PerspectiveCamera(37, width / height, .1, 250);
    const distance = fitBoxDistance(extent, direction, 37, width / height, 1.1, frame);
    camera.position.copy(new THREE.Vector3(...direction).normalize().multiplyScalar(distance));
    camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
    for (const x of [-extent[0]/2, extent[0]/2]) for (const y of [-extent[1]/2, extent[1]/2]) for (const z of [-extent[2]/2, extent[2]/2]) {
      const projected = new THREE.Vector3(x, y, z).project(camera);
      assert.ok(Math.abs(projected.x) < frame[0] && Math.abs(projected.y) < frame[1] && Math.abs(projected.z) < 1, `${context}: clipped at ${width}x${height}`);
    }
  }
  const ray = new THREE.Raycaster();
  for (const label of labels) {
    const decal = label.userData.decal;
    // A mounted cage/power grip legitimately covers the serial printing underneath the body.
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(label.matrixWorld);
    if (!explode && 'accessories' in config && config.accessories && normal.y < -.99 && (config.accessories as Record<string, boolean>).cage) continue;
    checkedLabels++;
    let minGap = Infinity, maxGap = -Infinity, missing = 0;
    const details: string[] = [];
    for (const u of [-.4, 0, .4]) for (const v of [-.34, 0, .34]) {
      const x = u * decal.width, y = v * decal.height;
      const angle = decal.radius ? (decal.curveAxis === 'x' ? x : y) / decal.radius : 0;
      const local = new THREE.Vector3(decal.radius && decal.curveAxis === 'x' ? decal.radius * Math.sin(angle) : x, decal.radius && decal.curveAxis === 'y' ? decal.radius * Math.sin(angle) : y, decal.radius ? decal.radius * (Math.cos(angle) - 1) : 0);
      const normal = new THREE.Vector3(decal.curveAxis === 'x' ? Math.sin(angle) : 0, decal.curveAxis === 'y' ? Math.sin(angle) : 0, Math.cos(angle)).transformDirection(label.matrixWorld);
      const point = local.applyMatrix4(label.matrixWorld);
      ray.set(point.clone().addScaledVector(normal, .2), normal.clone().negate()); ray.far = .4;
      const hit = ray.intersectObjects(solids, false)[0];
      const gap = hit ? hit.distance - .2 : null;
      if (gap === null) missing++;
      else { minGap = Math.min(minGap, gap); maxGap = Math.max(maxGap, gap); }
      if (gap !== null && gap < -.001) details.push(`${u},${v}: ${gap.toFixed(4)}`);
    }
    if (missing || minGap < -.001 || maxGap > .035) issues.push(`${context}: ${label.name}: gap ${minGap.toFixed(4)}..${maxGap.toFixed(4)}, missing ${missing}; ${details.join('; ')}`);
  }
}
await act(async () => root.unmount());
assert.deepEqual(issues, [], 'Decals must sit just outside their host surfaces');
console.log(`PASS: ${cases.length} actual scene configurations; ${checkedLabels} label placements; panels, screens, accessory clearances, and six views at three viewport sizes.`);
