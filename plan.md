# NOVA Camera — Project Plan

Updated: 28 October 2026

## Current status

The lighter interface, model refinements, and first-visit welcome guide are implemented. The latest production build passes, and the upload archive has been rebuilt with the welcome guide. All 26 automated tests passed before the welcome-guide change; the build was rerun after it.

**Remaining release requirement:** complete browser visual and interaction checks. No connected browser was available, and native Chrome access timed out twice. The site has been packaged locally, but has not been uploaded or published during this work.

## Goal

Create a polished, interactive camera configurator with a fully visible model, crisp surface lettering, a light visual identity, a brief introduction for new visitors, and a photo studio that lets users direct and capture their own product shots.

## Design direction

- **Typography:** locally bundled Anton, approved as an alternative to the TT Burn Condensed reference in `public/font-modern.png`.
- **Palette:** warm ivory `#F5F4F0`, soft blue-grey surfaces, ink `#243449`, cobalt `#2864D7`, and terracotta `#BF4325`. Camera paint remains independently customizable.
- **Model:** realistic materials, restrained reflections, readable markings attached to their surfaces, and complete framing across camera angles.
- **Interaction:** responsive controls, keyboard access, and respect for reduced-motion preferences. A short first-visit guide introduces navigation and features; the header help button reopens it.

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

- [x] Simplify the entire design: remove repeated captions, slogans, small secondary text, decorative lines, and the status footer. A subtle background wordmark was subsequently restored as requested.
- [x] Fix rotation/viewpoint controls: update the orbit once per frame, clear drag momentum before transitions, stop automatic rotation when choosing a view, and use icons with accessible labels and tooltips.
- [x] Simplify customization: remove promotional headings, duplicate controls, and accessory descriptions; combine price and summary into one footer action.
- [x] Add a visible reset camera button that restores the default view and zoom, stops rotation, and preserves customization.
- [x] Reduce visible controls: move presentation modes into More, and place surface finish, lens options, and saved configurations in expandable sections.
- [ ] Verify the simplified layout, icon controls, repeated view changes, and reset behavior visually on desktop and mobile. Chrome inspection was blocked by missing computer-use permissions.

## Top view and background refinement — 12 October 2026

- [x] Correct the top preset's 45-degree heading: keep the camera body horizontal and the lens pointing down in a nearly vertical overhead view.
- [x] Add a subtle, non-interactive NOVA background wordmark behind the camera.
- [x] Add a regression check for top-view orientation from every preset.
- [ ] Confirm the result visually in a browser when access is available.

## Priority 1 — Visual and interaction verification

Browser verification has been blocked by unavailable browser access. Complete these checks before considering the visual work finished.

- [ ] Inspect desktop, short-window, tablet, and mobile layouts with the light palette.
- [ ] Verify the welcome guide appears on a first visit, dismisses via its button and Escape, and stays dismissed after reload when storage is available.
- [ ] Verify the header help button reopens the guide, focus returns after dismissal, and its content scrolls on small screens.
- [ ] Check guide behavior with unavailable local storage and when opening a shared configuration link.
- [ ] Check Hero, Front, Back, Top, Side, and Detail views; rotate and zoom to their limits.
- [ ] Check all lenses, filters, the lens hood, viewfinders, and accessory combinations in assembled and exploded views.
- [ ] Confirm no floating, mirrored, overlapping, or clipped model text.
- [ ] Verify fullscreen entry, exit, resizing, and control visibility.
- [ ] Inspect all lighting presets on black, light, metallic, and custom bodies.
- [ ] Verify the Photo Studio panel stays within the viewport and remains scrollable on small screens.
- [ ] Verify keyboard navigation, Escape dismissal, focus visibility, sliders, and reduced-motion behavior.
- [ ] Download and inspect posters from portrait and landscape viewers, including Detail and Technical modes.
- [ ] Confirm poster text, lighting, and framing match the selected look; exported posters intentionally include an opaque studio background.
- [ ] Recheck Shot Lab, configuration sharing, save/load, reset, and model selection.

## Priority 2 — Final polish

- [ ] Fix issues found during visual verification before adding more features.
- [ ] Confirm product paint swatches remain clearly distinguishable on the light interface; product paint is independent of the interface palette.
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

Latest checks — 28 October 2026:

- [x] Production build passed after the welcome-guide addition.
- [x] All 26 automated tests passed after the palette/model changes, covering configuration persistence and sharing, pricing, framing, orbit transitions, model marking contrast, Shot Lab scoring, and studio controls.
- [x] `git diff --check` passed with the welcome-guide code changes.
- [x] Rebuilt `../nova-camera-upload.zip` from the latest `dist/`; verified archive integrity and `index.html` at its root.
- [ ] Browser visual acceptance and PNG export inspection remain outstanding.
- [ ] Upload to the intended host, then smoke-test the hosted page, assets, and shared configuration links.

The welcome guide was build-checked; the automated suite was not rerun for that UI-only addition. Automated results do not replace browser verification.

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
- New visitors can understand the main controls from the guide, dismiss it, and reopen it from the header.
- Lighting presets and turntable controls work predictably without unwanted motion.
- Exported posters are sharp, correctly framed, and readable.
- Build and automated tests pass, visual verification is documented, and the hosted upload passes a final smoke test.


## Final upload preparation — 28 October 2026

- Light palette applied across the configurator, all viewer modes, Studio, Shot Lab, dialogs, and PNG posters.
- Brighter ambient lighting preserves detail in dark camera materials.
- Lens hood now widens toward its front rim; the glass transform explicitly flattens along the optical axis.
- Body lettering and engraving adapt to paint brightness; silver lens barrel markings use dark ink.
- Detail mode retains the selected studio background instead of covering it with black.
- All 26 automated tests pass, including the new marking-contrast regression.
- Production build passes. The sibling `nova-camera-upload.zip` contains the built site with index.html at the archive root.
- Visual acceptance remains outstanding: no connected browser is available, and native Chrome access timed out twice. Desktop/mobile appearance, accessory intersections, fullscreen, and downloaded PNG appearance have not been visually certified in this pass.

## Welcome guide — 28 October 2026

- Added a dismissible first-visit introduction with mouse/touch instructions, customization, Studio, exploded view, Shot Lab, and sharing.
- Added an accessible header help button to reopen it; dismissal is remembered when local storage is available.
- Uses the existing keyboard-accessible dialog with responsive, scrollable content. Production build passes; browser visual verification remains unavailable.
