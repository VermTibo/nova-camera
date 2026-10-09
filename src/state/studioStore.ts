import { create } from 'zustand';

export const lightingLooks = {
  showroom: { name: 'Showroom', mood: 'Soft light. Every detail.', key: '#ffffff', fill: '#f3d2c6', rim: '#ffffff', backdrop: '#243a66', ambient: .5 },
  editorial: { name: 'Golden hour', mood: 'Warm edges. Deep shadows.', key: '#ffd6ad', fill: '#a8bfff', rim: '#ec562e', backdrop: '#60321e', ambient: .32 },
  midnight: { name: 'Blue hour', mood: 'Cool chrome. Electric color.', key: '#c5daff', fill: '#3478f7', rim: '#ec562e', backdrop: '#142e70', ambient: .25 },
} as const;
export type LightingLook = keyof typeof lightingLooks;
const clamp = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export const useStudio = create<{
  look: LightingLook; brightness: number; rotating: boolean; speed: number;
  setLook: (look: LightingLook) => void;
  setBrightness: (brightness: number) => void;
  setRotating: (rotating: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}>((set) => ({
  look: 'showroom', brightness: 1, rotating: false, speed: .45,
  setLook: look => set({ look }),
  setBrightness: value => set({ brightness: clamp(value, .6, 1.5, 1) }),
  setRotating: rotating => set({ rotating }),
  setSpeed: value => set({ speed: clamp(value, .15, 1.2, .45) }),
  reset: () => set({ look: 'showroom', brightness: 1, rotating: false, speed: .45 }),
}));
