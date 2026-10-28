import { create } from 'zustand';

export const lightingLooks = {
  showroom: { name: 'Showroom', mood: 'Soft light. Every detail.', key: '#ffffff', fill: '#e6efff', rim: '#ffffff', backdrop: '#f7f9fb', edge: '#dce5ed', ambient: .65 },
  editorial: { name: 'Golden hour', mood: 'Warm edges. Deep shadows.', key: '#ffd6ad', fill: '#a8bfff', rim: '#ec562e', backdrop: '#fff5e8', edge: '#e9c9b8', ambient: .45 },
  midnight: { name: 'Blue hour', mood: 'Cool chrome. Electric color.', key: '#c5daff', fill: '#3478f7', rim: '#ec562e', backdrop: '#f0f6ff', edge: '#b5c9e5', ambient: .4 },
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
