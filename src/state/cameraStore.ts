import { create } from "zustand";
import {
  defaults,
  fromSearch,
  normalize,
  type Configuration,
} from "./configuration";
import type { Accessory } from "../data/catalog";
export type Section =
  "Body" | "Lens" | "View" | "Handling" | "Accessories" | "Details";
export type Mode =
  "Product" | "Exploded" | "Technical" | "Detail" | "Cinematic";
export type View = "Hero" | "Front" | "Back" | "Top" | "Side" | "Detail";
interface State {
  config: Configuration;
  section: Section;
  mode: Mode;
  view: View;
  viewTick: number;
  notice: string;
  ready: boolean;
  selected: Section | null;
  set: <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
  toggle: (key: Accessory) => void;
  select: (section: Section) => void;
  setMode: (mode: Mode) => void;
  setView: (view: View) => void;
  reset: () => void;
  save: () => void;
  load: () => void;
  notify: (text: string) => void;
  setReady: () => void;
}
export const useCamera = create<State>((set, get) => ({
  config: fromSearch(window.location.search) || structuredClone(defaults),
  section: "Body",
  mode: "Product",
  view: "Hero",
  viewTick: 0,
  notice: "",
  ready: false,
  selected: null,
  set: (key, value) =>
    set((s) => ({ config: normalize({ ...s.config, [key]: value }) })),
  toggle: (key) =>
    set((s) => {
      const accessories = {
        ...s.config.accessories,
        [key]: !s.config.accessories[key],
      };
      if (key === "cage" && !accessories.cage) {
        accessories.topHandle = false;
        accessories.sideHandle = false;
      }
      return { config: normalize({ ...s.config, accessories }) };
    }),
  select: (section) => set({ section, selected: section }),
  setMode: (mode) =>
    set((s) => ({
      mode,
      ...(mode === "Detail"
        ? { view: "Detail" as const, viewTick: s.viewTick + 1 }
        : s.mode === "Detail"
          ? { view: "Hero" as const, viewTick: s.viewTick + 1 }
          : {}),
    })),
  setView: (view) =>
    set((s) => ({
      view,
      viewTick: s.viewTick + 1,
      ...(view === "Detail"
        ? { mode: "Detail" as const }
        : s.mode === "Detail"
          ? { mode: "Product" as const }
          : {}),
    })),
  reset: () => {
    set({
      config: structuredClone(defaults),
      mode: "Product",
      view: "Hero",
      viewTick: get().viewTick + 1,
    });
    get().notify("Configuration reset");
  },
  save: () => {
    try {
      localStorage.setItem("nova-saved", JSON.stringify(get().config));
      get().notify("Configuration saved on this device");
    } catch {
      get().notify("Storage is unavailable in this browser");
    }
  },
  load: () => {
    try {
      const v = localStorage.getItem("nova-saved");
      if (!v) return get().notify("No saved configuration on this device");
      set({ config: normalize(JSON.parse(v)) });
      get().notify("Saved configuration loaded");
    } catch {
      get().notify("Unable to load this configuration");
    }
  },
  notify: (notice) => set({ notice }),
  setReady: () => set({ ready: true }),
}));
