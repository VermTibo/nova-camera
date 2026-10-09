import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { fitBoxDistance, viewerFrame, type Vector } from './framing';

test('all assembly corners stay in frame across orbit angles and viewport shapes', () => {
  const directions: Vector[] = [[5.4,3,7.6], [0,.35,8.6], [0,1,-8], [.01,8.8,.01], [8.8,.8,.1], [0,-3,1], [-5,2,-3]];
  const assemblies: Vector[] = [[3.5,2.6,4], [5,5,7], [6,8,9]];
  for (const size of assemblies) for (const aspect of [.35,.6,1,1.6,3,5]) for (const direction of directions) {
    const distance = fitBoxDistance(size,direction,37,aspect);
    const camera = new PerspectiveCamera(37,aspect,.1,250);
    camera.position.copy(new Vector3(...direction).normalize().multiplyScalar(distance));
    camera.lookAt(0,0,0); camera.updateMatrixWorld();
    for (const x of [-size[0]/2,size[0]/2]) for (const y of [-size[1]/2,size[1]/2]) for (const z of [-size[2]/2,size[2]/2]) {
      const p = new Vector3(x,y,z).project(camera);
      assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1, 'model stays inside all four frame edges');
      assert.ok(p.z > -1 && p.z < 1, 'model stays between the near and far planes');
    }
  }
});
test('portrait canvases and larger assemblies get the extra distance they need', () => {
  assert.ok(fitBoxDistance([3,3,3],[1,1,1],37,.5) > fitBoxDistance([3,3,3],[1,1,1],37,2));
  assert.ok(fitBoxDistance([6,6,6],[1,1,1],37,2) > fitBoxDistance([3,3,3],[1,1,1],37,2));
  assert.ok(Number.isFinite(fitBoxDistance([3,3,3],[0,1,0],37,0)));
});

test('full-stage canvas keeps the product clear of overlays, even at maximum zoom', () => {
  for (const [width, height] of [[390, 620], [900, 528], [1050, 764], [1920, 1080]]) {
    const frame = viewerFrame(width, height);
    for (const direction of [[5, 3, 7], [0, 1, -8], [.01, 9, .01], [8, .8, .1]] as Vector[]) {
      const size: Vector = [6, 8, 9];
      const distance = fitBoxDistance(size, direction, 37, width / height, 1.1, frame);
      const camera = new PerspectiveCamera(37, width / height, .1, 250);
      camera.position.copy(new Vector3(...direction).normalize().multiplyScalar(distance));
      camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
      for (const x of [-3, 3]) for (const y of [-4, 4]) for (const z of [-4.5, 4.5]) {
        const point = new Vector3(x, y, z).project(camera);
        assert.ok(Math.abs(point.x) < frame[0] && Math.abs(point.y) < frame[1]);
      }
    }
  }
});
