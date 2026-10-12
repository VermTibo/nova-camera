# NOVA Camera — Project Plan

Updated: 12 October 2026

## Goal

Create a polished, interactive camera configurator with a fully visible model, crisp surface lettering, a cohesive visual identity, and a photo studio that lets users direct and capture their own product shots.

## Design direction

- **Typography:** locally bundled Anton, approved as an alternative to the TT Burn Condensed reference in `public/font-modern.png`.
- **Palette:** Pure Black `#000000`, Cobalt Blue `#3478F7`, Tangerine `#EC562E`, Petal Peach `#F3D2C6`, based on `public/kleur-modern.png`.
- **Model:** realistic materials, restrained reflections, readable markings attached to their surfaces, and complete framing across camera angles.
- **Interaction:** responsive controls, keyboard access, and respect for reduced-motion preferences.

## Implemented

These items are implemented in code; visual acceptance is still pending.

- [x] Expand the 3D canvas across the viewer.
- [x] Fit the model to the viewport and constrain zoom to prevent cropping.
- [x] Make fullscreen expand the viewer itself.
- [x] Apply Anton and the new interface palette, including Shot Lab.
- [x] Curve front lens lettering around the rim and barrel labels around the lens surface.
- [x] Correct viewfinder logo placement and preserve natural letter proportions.
- [x] Increase rendering resolution, refine glass and reflections, and remove Detail-view blur.
- [x] Add Photo Studio with Showroom, Golden Hour, and Blue Hour lighting.
- [x] Add adjustable light intensity and turntable speed with play/pause controls.
- [x] Add local PNG poster export at 1920 × 1440 using the current camera angle.
- [x] Add regression coverage for framing, decal geometry, and studio controls.

## User feedback — 12 October 2026

Implemented in code; browser visual acceptance is still pending.

- [x] Make the camera flip smooth using a damped orbit around the model, shortest-angle transitions, and reduced-motion support.
- [x] Make the customization bar less crowded with larger clickable tabs, keyboard navigation, a compact heading, and less secondary copy.
- [x] Keep handles and cage independent, including pricing, save/load, and shared links; add standalone handle mounts to the model.
- [x] Make the playable game button more prominent with a gamepad icon and explicit “Play game” label.
- [x] Add responsive desktop, tablet, mobile, and short-window layouts with larger touch controls and scrollable dialogs.
- [ ] Visually verify flips, all tab contents, standalone mounts, game launch, and responsive layouts in a connected browser.

## Additional user feedback — 12 October 2026

Implemented in code; visual acceptance remains pending.

- [x] Simplify the entire design: remove repeated captions, slogans, small secondary text, decorative lines, the background wordmark, and the status footer.
- [x] Fix rotation/viewpoint controls: update the orbit once per frame, clear drag momentum before transitions, stop automatic rotation when choosing a view, and use icons with accessible labels and tooltips.
- [x] Simplify customization: remove promotional headings, duplicate controls, and accessory descriptions; combine price and summary into one footer action.
- [x] Add a visible reset camera button that restores the default view and zoom, stops rotation, and preserves customization.
- [x] Reduce visible controls: move presentation modes into More, and place surface finish, lens options, and saved configurations in expandable sections.
- [ ] Verify the simplified layout, icon controls, repeated view changes, and reset behavior visually on desktop and mobile. Chrome inspection was blocked by missing computer-use permissions.

## Priority 1 — Visual and interaction verification

Browser verification has been blocked by unavailable browser access. Complete these checks before considering the visual work finished.

- [ ] Inspect desktop, short-window, tablet, and mobile layouts.
- [ ] Check Hero, Front, Back, Top, Side, and Detail views; rotate and zoom to their limits.
- [ ] Check all lenses, filters, the lens hood, viewfinders, and accessory combinations in assembled and exploded views.
- [ ] Confirm no floating, mirrored, overlapping, or clipped model text.
- [ ] Verify fullscreen entry, exit, resizing, and control visibility.
- [ ] Inspect all lighting presets on black, light, metallic, and custom bodies.
- [ ] Verify the Photo Studio panel stays within the viewport and remains scrollable on small screens.
- [ ] Verify keyboard navigation, Escape dismissal, focus visibility, sliders, and reduced-motion behavior.
- [ ] Download and inspect posters from portrait and landscape viewers, including Detail and Technical modes.
- [ ] Confirm poster text, lighting, framing, and transparency match the intended output.
- [ ] Recheck Shot Lab, configuration sharing, save/load, reset, and model selection.

## Priority 2 — Final polish

- [ ] Fix issues found during visual verification before adding more features.
- [ ] Audit remaining legacy color names and swatches in the product catalog against the new palette.
- [ ] Review small text contrast and legibility in the configurator and studio panel.
- [ ] Check performance while changing lighting, rotating, and adding accessories on a lower-powered device.
- [ ] Tune reflection resolution or rendering quality if profiling shows a need.
- [ ] Capture approved desktop and mobile screenshots as visual references.

## Optional next phase

These are proposals, not implemented features or committed scope.

- [ ] Save named studio setups containing the lighting look, intensity, and camera angle.
- [ ] Offer poster aspect ratios and an optional clean product-only export.
- [ ] Add a guided tour of camera features with surface-anchored annotations.
- [ ] Allow comparison of two camera configurations.

## Validation

Most recent completed checks (12 October 2026): production build passed; all 24 automated tests passed, including independent handle/cage pricing and persistence shortest-orbit transitions, camera reset, and repeated preset selection. Browser visual verification remains blocked: no browser connector is available, and native Chrome inspection requires unavailable computer-use permissions. These checks do not replace browser or export verification.

```bash
npm run dev
npm run build
npm test
```

Use the local address printed by Vite; the port can change if another server is running.

## Completion criteria

- The complete camera remains visible at supported viewport sizes and normal zoom limits.
- Model lettering follows the correct surface without visible distortion or overlap.
- Controls remain usable on desktop and mobile, including fullscreen and keyboard operation.
- Lighting presets and turntable controls work predictably without unwanted motion.
- Exported posters are sharp, correctly framed, and readable.
- Build and automated tests pass, and visual verification is documented.
