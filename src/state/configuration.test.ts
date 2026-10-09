import test from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  normalize,
  price,
  shareUrl,
  fromSearch,
} from "./configuration";
import { lenses, accessoryCatalog } from "../data/catalog";
test("default system has the expected live price", () =>
  assert.equal(price(defaults), 5180));
test("complete configuration survives a shared URL", () => {
  const c = normalize({
    ...defaults,
    body: "N1C",
    lens: "70-200",
    color: "#123abc",
    grip: "Walnut",
    engraving: "MY STUDIO",
    hood: true,
    accessories: { flash: true, microphone: true, topHandle: true },
  });
  const url = shareUrl(c, "https://camera.example/configurator?debug=true#old");
  assert.deepEqual(fromSearch(new URL(url).search), c);
  assert.equal(new URL(url).hash, "");
  assert.equal(new URL(url).searchParams.has("debug"), false);
});
test("untrusted URL data cannot break rendering", () => {
  const c = normalize({
    body: "missing",
    lens: "infinity",
    color: "url(evil)",
    hood: "true",
    engraving: "<script>alert(1)</script>",
    accessories: { flash: "yes" },
  });
  assert.equal(c.body, "N1");
  assert.equal(c.lens, "24-70");
  assert.equal(c.color, defaults.color);
  assert.equal(c.hood, false);
  assert.equal(c.accessories.flash, false);
  assert.equal(c.engraving.includes("<"), false);
  assert.ok(c.engraving.length <= 18);
});
test("malformed encoded JSON falls back safely", () =>
  assert.equal(fromSearch("?config=%7Bbad"), null));
test("friendly URL aliases load a real optical system", () => {
  const c = fromSearch("?body=titanium&lens=85mm&cage=true&flash=false")!;
  assert.equal(c.lens, "85");
  assert.equal(c.accessories.cage, true);
  assert.equal(c.accessories.flash, false);
});
test("both handles imply their physically required cage", () => {
  for (const part of ["sideHandle", "topHandle"])
    assert.equal(
      normalize({ accessories: { [part]: true } }).accessories.cage,
      true,
    );
});
test("each lens changes total by its actual catalog price", () => {
  for (const lens of lenses)
    assert.equal(price({ ...defaults, lens: lens.id }), 3290 + lens.price);
});
test("accessories add their full cost and every material option is accounted for", () => {
  const c = normalize({
    ...defaults,
    grip: "Walnut",
    filter: "ND",
    mount: "PL adapter",
    viewfinder: "Cinema",
    sensor: "Monochrome",
    hood: true,
    accessories: Object.fromEntries(
      Object.keys(accessoryCatalog).map((k) => [k, true]),
    ),
  });
  assert.equal(
    price(c),
    5180 +
      Object.values(accessoryCatalog).reduce((s, a) => s + a.price, 0) +
      180 +
      150 +
      320 +
      290 +
      400 +
      90,
  );
});
test("normalization never mutates defaults", () => {
  const c = normalize({});
  c.accessories.cage = true;
  assert.equal(defaults.accessories.cage, false);
});
test("store save, reset and load preserve a complete system in device storage", async () => {
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    value: { location: { search: "" } },
    configurable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      setItem: (k: string, v: string) => memory.set(k, v),
      getItem: (k: string) => memory.get(k) ?? null,
    },
    configurable: true,
  });
  const { useCamera } = await import("./cameraStore");
  useCamera.getState().set("lens", "105");
  useCamera.getState().toggle("topHandle");
  useCamera.getState().set("engraving", "TEST STUDIO");
  const saved = structuredClone(useCamera.getState().config);
  useCamera.getState().save();
  useCamera.getState().reset();
  assert.equal(useCamera.getState().config.lens, "24-70");
  useCamera.getState().load();
  assert.deepEqual(useCamera.getState().config, saved);
  useCamera.getState().toggle("cage");
  assert.equal(useCamera.getState().config.accessories.topHandle, false);
  assert.equal(useCamera.getState().config.accessories.cage, false);
});
