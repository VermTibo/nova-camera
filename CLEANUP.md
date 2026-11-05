# Cleanup audit

## Follow-up — 5 November 2026

Preserved the existing cleanup and made these additional changes:

- Removed 225 fully overridden declarations from `global.css` and
  `refinements.css`, then removed the empty rules. A declaration was removed
  only when a later rule with the exact same selector and property supersedes
  it under the same media condition or unconditionally, respecting `!important`.
  Remaining rules retain their original order.
- Replaced a frame-local distance ref with a local variable, removed redundant
  checks for the always-created orbit controls, and removed an unnecessary JSX
  fragment around the technical-view mesh.
- Removed the duplicate share-dialog state update on clipboard failure. The
  dialog still opens before copying and keeps the URL available for manual use.
- Reused one currency formatter instead of constructing one for every price.
- Enabled TypeScript's `noUnusedLocals` and `noUnusedParameters` build checks.
- Replaced the letter favicon with a small camera SVG using the existing palette.

Validation: lint, production build, all 30 regression tests, and the model audit
(48 configurations / 1,530 label placements) passed. A temporary CSS comparison
confirmed matching final declarations per exact selector/property in 120 viewport
and reduced-motion combinations. This is a static comparison, not a browser
rendering test. The built CSS decreased from 41.68 kB to 36.32 kB (uncompressed).
The favicon parses as valid SVG and is copied into the production build.

Browser verification could not run: the browser access host was unavailable and
native Chrome access was not approved. Interactive visual verification remains
outstanding.

## Initial audit — 3 November 2026

The removal categories and reasons were explained in chat before editing. This
audit covers application imports, tests, the model-inspection script, package
scripts, public asset references, and CSS selectors.

## Removed packages

| Package                       | Reason                                                               |
| ----------------------------- | -------------------------------------------------------------------- |
| `@react-three/postprocessing` | No imports or configured use in the application or validation tools. |
| `n8ao`, `postprocessing`      | npm pruned these dependencies after removing the unused wrapper.     |

All other declared packages support runtime code, build commands, tests, or
TypeScript types. `three-stdlib` is now a direct dependency at its existing
installed version range: `Studio.tsx` imports its orbit controls directly and
previously relied on Drei bringing it in transitively. No installed package
versions were upgraded.

## Removed files

Only Anton is loaded by CSS, the HTML preload, and poster export. Removed these
unused alternative fonts and their accompanying attribution files:

- `public/fonts/Charsenz.otf`
- `public/fonts/Charsenz-SOURCE.txt`
- `public/fonts/Daltown-Demo.otf`
- `public/fonts/Daltown-LICENSE.txt`
- `public/fonts/Itim-Regular.ttf`
- `public/fonts/Itim-LICENSE.txt`
- `public/fonts/Itim-SOURCE.txt`

No `counter.js`, `vite.svg`, `javascript.svg`, or `react.svg` exists in Nova
Camera. The counter and Vite logo found in the sibling `my-first-project`
directory belong to that project and were left there. Nova's favicon and Sony,
Fujifilm, and Nikon logos are used by the interface.

## Removed code

| Location                    | Removal and evidence                                                                                                                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/state/cameraStore.ts`  | `selected` duplicated the selected section, was written by `select`, and was never read. `section` remains the source of truth.                                                                                                                    |
| `src/scene/Studio.tsx`      | The product's `elapsed` ref was incremented each frame but never read. Animation still uses frame delta.                                                                                                                                           |
| `src/scene/Accessories.tsx` | Unused `bottomMount`, `leftMount`, and `topMount` coordinates. The used right mount is now the local `sideHandleMount` constant.                                                                                                                   |
| `src/data/catalog.ts`       | Unread `cameraChoices` fields: `number`, `name`, `category`, `description`, `lens`, `format`, `system`, and `className`. Removed unused accessory `detail` copy. Rendered model names, specifications, and prices remain in their active catalogs. |
| `src/state/studioStore.ts`  | Unread lighting-look `mood` captions.                                                                                                                                                                                                              |

All TypeScript/TSX modules are reachable from the app, tests, or validation/build
entry points; no source module was deleted.

Removed 186 obsolete CSS selector entries across `global.css`, `refinements.css`,
`photo-studio.css`, and `shot-lab.css`, including responsive variants:

- Header decoration: `header-center`, `status-dot`, `header-divider`, `tiny-square`.
- Viewer captions: `edition-mark`, `background-type`, `product-caption`,
  `caption-line`, `stage-bottom`, `technical-caption`.
- Old configurator content: `step-count`, `section-heading`, `color-caption`,
  `module-note`, `module-mark`, `total-line`, `review-button`, `footer-meta`,
  `field-note`, `spec-card`.
- Removed footer and mobile sheet: `global-footer`, `render-status`,
  `sheet-handle`, `configurator.expanded`.
- Removed labels: `photo-kicker`, `play-tag`, wordmark spans, stage-heading
  paragraphs/eyebrows, configurator-title eyebrows/line breaks, category-tab
  spans, body-option small text, and game-button small text.

Retained CSS declarations, rule order, and responsive conditions were preserved.
This was not a general consolidation of overlapping style rules.

## Unused at runtime, retained as reference material

These images have no application imports or asset URLs. They are design/model
references, not Vite examples, so they remain available for future design work:

- Camera references: `public/camera.jpg`, `public/fuji.webp`, `public/nikon.png`.
- Typography references: `public/font.png`, `public/font-modern.png`,
  `public/font_final.png`, `public/font_final_2.png`.
- Palette references: `public/kleur.png`, `public/kleur-modern.png`,
  `public/kleur final.png`.
- Layout reference: `public/cut off error.png`.

Because these remain in `public/`, Vite still copies them into the build.
Documentation, font licenses, logo attribution, tests, and inspection scripts
are retained for their non-runtime purposes.

## Comments and validation

Added short comments explaining stylesheet override order, the repeated-view
counter, legacy URL field meanings, and browser stubs before dynamic imports.

- `npm run build`: passed.
- `npm test`: all 30 tests passed.
- `npm run check:models`: 48 configurations and 1,530 label placements passed.
- TypeScript with `--noUnusedLocals --noUnusedParameters`: passed.
- `npm ls --depth=0`: no missing or invalid direct dependencies.
- `git diff --check`: passed.
- Browser visual verification was not performed.
