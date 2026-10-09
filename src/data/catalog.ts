export const colors = [
  { name: "Black", hex: "#181818" },
  { name: "Crayola Red", hex: "#ed254e" },
  { name: "Gunmetal", hex: "#002a32" },
  { name: "White", hex: "#ffffff" },
];
export const bodyNames = { N1: "A7 III", N1R: "A7R", N1C: "A7C" };
export const lenses = [
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
    detail: "Machined aluminum · ¼″ mounting",
    price: 240,
  },
  topHandle: {
    name: "Top handle",
    detail: "Includes cage · low-angle control",
    price: 160,
  },
  sideHandle: {
    name: "Side handle",
    detail: "Includes cage · walnut grip",
    price: 140,
  },
  flash: {
    name: "Studio flash",
    detail: "Hot shoe · articulated head",
    price: 380,
  },
  microphone: {
    name: "Shotgun microphone",
    detail: "Shock-mounted · directional audio",
    price: 220,
  },
  monitor: {
    name: "Field monitor",
    detail: "5″ display · dedicated side arm",
    price: 490,
  },
  batteryGrip: {
    name: "Power grip",
    detail: "Dual battery · vertical controls",
    price: 290,
  },
  strap: {
    name: "Woven strap",
    detail: "Quick-release · graphite weave",
    price: 65,
  },
  rails: {
    name: "15mm rail system",
    detail: "Baseplate · dual support rods",
    price: 180,
  },
};
export type Accessory = keyof typeof accessoryCatalog;
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
