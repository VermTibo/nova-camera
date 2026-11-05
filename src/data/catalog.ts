export const colors = [
  { name: "Black", hex: "#181818" },
  { name: "Crayola Red", hex: "#ed254e" },
  { name: "Gunmetal", hex: "#002a32" },
  { name: "White", hex: "#ffffff" },
];
export const bodyNames = { N1: "A7 III", XT50: "X-T50", D7500: "D7500" };
export type BodyId = keyof typeof bodyNames;
export const bodyBrands: Record<BodyId, string> = {
  N1: "SONY",
  XT50: "FUJIFILM",
  D7500: "NIKON",
};
export const bodyPrices: Record<BodyId, number> = {
  N1: 3290,
  XT50: 1490,
  D7500: 1190,
};
export const defaultLenses: Record<BodyId, string> = {
  N1: "24-70",
  XT50: "16-50",
  D7500: "18-140",
};
export const lensFamily = (body: BodyId) =>
  body === "XT50" ? "FUJINON XF" : body === "D7500" ? "AF-S NIKKOR" : "SONY FE";
export const cameraChoices = [
  { id: "N1", brand: "Sony", logo: "/logos/sony.svg" },
  { id: "XT50", brand: "Fujifilm", logo: "/logos/fujifilm.svg" },
  { id: "D7500", brand: "Nikon", logo: "/logos/nikon.svg" },
] as const;
export const lenses = [
  {
    id: "16-50",
    name: "16–50mm",
    type: "Zoom",
    aperture: "2.8–4.8",
    length: 1.25,
    radius: 0.84,
    price: 699,
  },
  {
    id: "18-140",
    name: "18–140mm",
    type: "Zoom",
    aperture: "3.5–5.6",
    length: 2.05,
    radius: 0.89,
    price: 499,
  },
  {
    id: "24",
    name: "24mm",
    type: "Prime",
    aperture: "1.8",
    length: 1.05,
    radius: 0.72,
    price: 690,
  },
  {
    id: "35",
    name: "35mm",
    type: "Prime",
    aperture: "1.4",
    length: 1.25,
    radius: 0.76,
    price: 890,
  },
  {
    id: "50",
    name: "50mm",
    type: "Prime",
    aperture: "1.4",
    length: 1.45,
    radius: 0.8,
    price: 990,
  },
  {
    id: "85",
    name: "85mm",
    type: "Prime",
    aperture: "1.2",
    length: 1.8,
    radius: 0.91,
    price: 1490,
  },
  {
    id: "105",
    name: "105mm",
    type: "Macro",
    aperture: "2.8",
    length: 2.05,
    radius: 0.83,
    price: 1290,
  },
  {
    id: "24-70",
    name: "24–70mm",
    type: "Zoom",
    aperture: "2.8",
    length: 2.2,
    radius: 0.88,
    price: 1890,
  },
  {
    id: "70-200",
    name: "70–200mm",
    type: "Zoom",
    aperture: "2.8",
    length: 3.2,
    radius: 0.95,
    price: 2490,
  },
];
export const accessoryCatalog = {
  cage: {
    name: "Precision cage",
    price: 240,
  },
  topHandle: {
    name: "Top handle",
    price: 160,
  },
  sideHandle: {
    name: "Side handle",
    price: 140,
  },
  flash: {
    name: "Studio flash",
    price: 380,
  },
  microphone: {
    name: "Shotgun microphone",
    price: 220,
  },
  monitor: {
    name: "Field monitor",
    price: 490,
  },
  batteryGrip: {
    name: "Power grip",
    price: 290,
  },
  strap: {
    name: "Woven strap",
    price: 65,
  },
  rails: {
    name: "15mm rail system",
    price: 180,
  },
};
export type Accessory = keyof typeof accessoryCatalog;
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
export const money = (value: number) => currencyFormatter.format(value);
