import { accessoryCatalog, lenses, type Accessory } from "../data/catalog";
export interface Configuration {
  body: "N1" | "N1R" | "N1C";
  color: string;
  finish: "Satin" | "Matte" | "Brushed";
  grip: "Rubber" | "Leather" | "Walnut";
  lens: string;
  lensFinish: "Obsidian" | "Silver";
  hood: boolean;
  filter: "None" | "UV" | "ND";
  viewfinder: "Standard" | "Cinema" | "None";
  screen: "Flush" | "Articulated";
  sensor: "Full frame" | "Monochrome";
  accent: string;
  mount: "N mount" | "PL adapter";
  engraving: string;
  accessories: Record<Accessory, boolean>;
}
export const defaults: Configuration = {
  body: "N1",
  color: "#181818",
  finish: "Matte",
  grip: "Rubber",
  lens: "24-70",
  lensFinish: "Obsidian",
  hood: false,
  filter: "None",
  viewfinder: "Standard",
  screen: "Flush",
  sensor: "Full frame",
  accent: "#3478f7",
  mount: "N mount",
  engraving: "",
  accessories: {
    cage: false,
    topHandle: false,
    sideHandle: false,
    flash: false,
    microphone: false,
    monitor: false,
    batteryGrip: false,
    strap: false,
    rails: false,
  },
};
const choices = {
  body: ["N1", "N1R", "N1C"],
  finish: ["Satin", "Matte", "Brushed"],
  grip: ["Rubber", "Leather", "Walnut"],
  lens: lenses.map((l) => l.id),
  lensFinish: ["Obsidian", "Silver"],
  filter: ["None", "UV", "ND"],
  viewfinder: ["Standard", "Cinema", "None"],
  screen: ["Flush", "Articulated"],
  sensor: ["Full frame", "Monochrome"],
  mount: ["N mount", "PL adapter"],
};
export function normalize(value: unknown): Configuration {
  const c = structuredClone(defaults);
  if (!value || typeof value !== "object") return c;
  const v = value as Record<string, unknown>;
  for (const [key, options] of Object.entries(choices))
    if (typeof v[key] === "string" && options.includes(v[key] as string))
      (c as unknown as Record<string, unknown>)[key] = v[key];
  for (const key of ["color", "accent"] as const)
    if (typeof v[key] === "string" && /^#[0-9a-f]{6}$/i.test(v[key]))
      c[key] = v[key];
  if (typeof v.hood === "boolean") c.hood = v.hood;
  if (typeof v.engraving === "string")
    c.engraving = v.engraving.replace(/[^a-z0-9 .-]/gi, "").slice(0, 18);
  if (v.accessories && typeof v.accessories === "object")
    for (const key of Object.keys(c.accessories) as Accessory[])
      c.accessories[key] =
        (v.accessories as Record<string, unknown>)[key] === true;
  if (c.accessories.topHandle || c.accessories.sideHandle)
    c.accessories.cage = true;
  return c;
}
export function fromSearch(search: string): Configuration | null {
  const p = new URLSearchParams(search);
  const encoded = p.get("config");
  if (encoded) {
    try {
      return normalize(JSON.parse(encoded));
    } catch {
      return null;
    }
  }
  if (!p.has("body") && !p.has("lens")) return null;
  const colorNames: Record<string, string> = {
    titanium: "#96978d",
    black: "#25272a",
    silver: "#c6c8c8",
    graphite: "#585d61",
  };
  return normalize({
    color: colorNames[p.get("body") || ""],
    lens: p.get("lens")?.replace("mm", ""),
    accessories: Object.fromEntries(
      Object.keys(defaults.accessories).map((k) => [k, p.get(k) === "true"]),
    ),
  });
}
export function shareUrl(c: Configuration, href: string): string {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("config", JSON.stringify(c));
  return url.toString();
}
export function price(c: Configuration) {
  return (
    { N1: 3290, N1R: 4290, N1C: 4890 }[c.body] +
    (lenses.find((l) => l.id === c.lens)?.price || 0) +
    Object.entries(c.accessories).reduce(
      (sum, [k, on]) => sum + (on ? accessoryCatalog[k as Accessory].price : 0),
      0,
    ) +
    (c.hood ? 90 : 0) +
    { None: 0, UV: 60, ND: 150 }[c.filter] +
    (c.mount === "PL adapter" ? 320 : 0) +
    (c.grip === "Walnut" ? 180 : c.grip === "Leather" ? 90 : 0) +
    (c.viewfinder === "Cinema" ? 290 : 0) +
    (c.sensor === "Monochrome" ? 400 : 0)
  );
}
