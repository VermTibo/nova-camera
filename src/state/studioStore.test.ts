import test from 'node:test';
import assert from 'node:assert/strict';
import { useStudio } from './studioStore';

test('lighting and turntable controls reject non-finite values and constrain usable ranges', () => {
  const studio = useStudio.getState();
  studio.setBrightness(Infinity);
  assert.equal(useStudio.getState().brightness, 1);
  studio.setBrightness(-20);
  assert.equal(useStudio.getState().brightness, .6);
  studio.setSpeed(100);
  assert.equal(useStudio.getState().speed, 1.2);
  studio.setSpeed(NaN);
  assert.equal(useStudio.getState().speed, .45);
  studio.setLook('midnight'); studio.setRotating(true);
  assert.equal(useStudio.getState().look, 'midnight');
  assert.equal(useStudio.getState().rotating, true);
  studio.reset();
  assert.equal(useStudio.getState().look, 'showroom');
  assert.equal(useStudio.getState().rotating, false);
  assert.equal(useStudio.getState().brightness, 1);
});
