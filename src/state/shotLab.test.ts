import test from 'node:test';
import assert from 'node:assert/strict';
import { assessShot, challenges } from './shotLab';

test('each challenge has an achievable high-scoring photograph', () => {
  const solutions = [
    { aperture: 2.8, shutter: 60, iso: 100, focus: 2 },
    { aperture: 2.8, shutter: 500, iso: 100, focus: 6 },
    { aperture: 2.8, shutter: 60, iso: 1600, focus: 4 },
  ];
  solutions.forEach((s, i) => assert.ok(assessShot(s, challenges[i]).score >= 98));
});
test('doubling ISO adds exactly one stop of light', () => {
  const s = { ...challenges[0].initial };
  const first = assessShot(s, challenges[0]);
  const second = assessShot({ ...s, iso: s.iso * 2 }, challenges[0]);
  assert.ok(Math.abs(first.exposureError - second.exposureError - 1) < .0001);
});
test('a slow shutter loses motion points even when exposure and focus are correct', () => {
  const fast = assessShot({ aperture: 2.8, shutter: 500, iso: 100, focus: 6 }, challenges[1]);
  const slow = assessShot({ aperture: 8, shutter: 60, iso: 100, focus: 6 }, challenges[1]);
  assert.equal(fast.motion, 20);
  assert.equal(slow.motion, 0);
  assert.ok(fast.score > slow.score);
});
test('missing focus lowers the score without changing the exposure', () => {
  const s = { aperture: 2.8, shutter: 60, iso: 100, focus: 2 };
  const sharp = assessShot(s, challenges[0]);
  const blurred = assessShot({ ...s, focus: 8 }, challenges[0]);
  assert.equal(sharp.exposure, blurred.exposure);
  assert.equal(blurred.focus, 0);
  assert.ok(blurred.score < sharp.score);
});
test('scores stay within the 0–100 range at control extremes', () => {
  for (const challenge of challenges)
    for (const aperture of [1.8, 16])
      for (const shutter of [15, 1000])
        for (const iso of [100, 6400])
          for (const focus of [.5, 10]) {
            const shot = assessShot({ aperture, shutter, iso, focus }, challenge);
            assert.ok(shot.score >= 0 && shot.score <= 100);
          }
});
