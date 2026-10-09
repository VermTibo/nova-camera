export const apertures = [1.8, 2.8, 4, 5.6, 8, 11, 16];
export const shutters = [15, 30, 60, 125, 250, 500, 1000];
export const isos = [100, 200, 400, 800, 1600, 3200, 6400];
export interface ShotSettings { aperture: number; shutter: number; iso: number; focus: number; }
export const challenges = [
  { title: 'The quiet moment', subject: 'Still life', scene: 'still', distance: 2, ev: 9, minShutter: 60,
    brief: 'Make the vase sharp and give it a balanced exposure. Start by bringing the focus to 2 metres.',
    hint: 'Try f/2.8, 1/60s, ISO 100 and focus at 2m. A wider aperture lets more light in.',
    initial: { aperture: 4, shutter: 125, iso: 100, focus: 5 } },
  { title: 'Catch the motion', subject: 'Street cycling', scene: 'motion', distance: 6, ev: 12, minShutter: 500,
    brief: 'Freeze the cyclist at 6 metres. A fast shutter stops the action, but also lets in less light.',
    hint: 'Try f/2.8, 1/500s, ISO 100 and focus at 6m. At least 1/500s freezes this subject.',
    initial: { aperture: 5.6, shutter: 60, iso: 100, focus: 3 } },
  { title: 'After hours', subject: 'Night architecture', scene: 'night', distance: 4, ev: 5, minShutter: 60,
    brief: 'Photograph the neon doorway at 4 metres. Open the aperture and raise ISO to work with the low light.',
    hint: 'Try f/2.8, 1/60s, ISO 1600 and focus at 4m. Higher ISO brightens the image.',
    initial: { aperture: 8, shutter: 250, iso: 100, focus: 7 } },
] as const;
export type Challenge = typeof challenges[number];
export function assessShot(settings: ShotSettings, challenge: Challenge) {
  const exposureError = Math.log2(settings.aperture ** 2 * settings.shutter * 100 / settings.iso) - challenge.ev;
  const focusError = Math.abs(settings.focus - challenge.distance);
  const motionError = Math.max(0, Math.log2(challenge.minShutter / settings.shutter));
  const focus = Math.max(0, 40 - focusError * 12);
  const exposure = Math.max(0, 40 - Math.abs(exposureError) * 12);
  const motion = Math.max(0, 20 - motionError * 10);
  return {
    score: Math.round(focus + exposure + motion),
    exposureError, focusError, motionError,
    focus: Math.round(focus), exposure: Math.round(exposure), motion: Math.round(motion),
    feedback: [
      focusError <= .3 ? 'Focus is right on the subject.' : `Focus missed the subject. Bring it closer to ${challenge.distance}m.`,
      Math.abs(exposureError) <= .5 ? 'The exposure is nicely balanced.' : exposureError > 0 ? 'Too dark. Open the aperture, lower the shutter speed, or raise ISO.' : 'Too bright. Close the aperture, increase shutter speed, or lower ISO.',
      motionError === 0 ? 'Your shutter is fast enough for a sharp shot.' : `Motion blur: use at least 1/${challenge.minShutter}s for this scene.`,
    ],
  };
}
