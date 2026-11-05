# NOVA — Camera System

**Your perspective. No limits.**

NOVA uses a light ivory and blue-grey studio interface with cobalt selections and terracotta actions. Camera paint remains independently customizable.

NOVA is an interactive 3D camera configurator with Sony Alpha, Fujifilm X-T50, and Nikon D7500 camera models. Build a camera, explore its components, direct the lighting, and export a product poster—all in the browser.

The cameras are procedural concept models built from photographic references. The Fujifilm and Nikon models use `public/fuji.webp` and `public/nikon.png`; details not visible in these single views are approximations, not manufacturer CAD. Product names, specifications, and prices are presentation data; the app has no checkout or backend.

## Quick start

Use Node.js 22.12+ and npm, plus a browser with WebGL 2 and hardware acceleration enabled.

From the project directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The usual port is `5173`; Vite selects another port if it is occupied. No API keys, accounts, or environment variables are required.

The app opens directly in the studio. Choose Sony A7 III, Fujifilm X-T50, or Nikon D7500 under **Body** in the configurator. **Change camera** in the header focuses the selected body option without leaving the viewer. Shared configuration URLs open their configured model directly. Locally bundled brand logos identify each body; sources are in [public/logos/SOURCES.md](public/logos/SOURCES.md).

First-time visitors see a short welcome guide covering navigation, customization, Studio, and Shot Lab. Dismissing it is remembered on the device; the header help button reopens it anytime.

## Features

### Interactive camera viewer

- Rotate the model by dragging and zoom with the scroll wheel or pinch gesture.
- Use the icon buttons for Hero, Front, Back, Top, Side, and Detail viewpoints; each has a tooltip and accessible label. Selecting a view stops automatic rotation.
- Open **More** to explode or assemble the camera and switch presentation modes.
- **Reset camera** restores the default view and zoom, stops rotation, and keeps your customization.
- Expand the viewer with the fullscreen button.
- Automatic framing accounts for viewport size, lens changes, and accessories. Zoom is constrained to keep the assembly visible.
- Surface-following lens markings, a curved front inscription, and sharp Detail rendering keep the model readable.

### Camera configurator

Customize three concept bodies labeled A7 III, X-T50, and D7500. Fuji has a compact body, angular finder, twin dials, shallow grip, and 16–50mm lens. Nikon has a sculpted prism, deeper grip, red trim, and 18–140mm lens with an instanced rubber tread. Options include:

- Body color, finish, grip material, and engraving.
- Nine lenses, lens finish, hood, and UV/ND filters.
- Viewfinder, rear screen, sensor, mount, and accent color.
- Cage, top handle, side handle, flash, microphone, monitor, battery grip, strap, and rails.

Surface finish and lens options expand on demand. The footer combines the total price and expandable summary. Prices update as the configuration changes. Handles use independent mounts; selecting a handle or removing the cage leaves other accessory choices unchanged. Clicking model components opens the corresponding configuration section.

### Photo Studio

Open **STUDIO** beside **More** to direct your product shot.

| Look        | Direction                                 |
| ----------- | ----------------------------------------- |
| Showroom    | Soft, neutral light that reveals detail   |
| Golden Hour | Warm highlights and deeper shadows        |
| Blue Hour   | Cool lighting with contrasting warm edges |

Adjust light intensity, start or pause the turntable, and set its speed. **CAPTURE POSTER** downloads a 1920 × 1440 PNG using the current angle, camera name, lens, and lighting look. Poster generation happens locally in the browser.

Studio settings last for the current page session. Configuration links do not include lighting, rotation, or viewpoint settings.

### Shot Lab

Select **PLAY GAME** for an illustrated photography simulator with three challenges: a still life, a moving cyclist, and a night scene. Adjust focus distance, aperture, shutter speed, and ISO, then capture a shot and review the feedback.

Each shot scores up to 100 points: 40 for focus, 40 for exposure, and 20 for motion sharpness. This is a simplified learning simulation and does not access a webcam. Closing the lab resets its progress without changing the configured camera.

## Save and share

Expand **Saved configuration** in **Details** for save, load, and configuration reset actions. Saved configurations use browser `localStorage` and belong to the current browser and origin. Changing the local server port creates a different origin, so a save from another port will not appear there.

**Share Configuration** creates a URL containing the camera configuration. The app attempts to copy it to the clipboard and also displays it in a selectable text field. Recipients need access to the app at the link's address; a `localhost` link is only useful on a machine running the project at that address.

Incoming configuration data is validated before use. Resetting the current configuration restores the selected body’s default lens and finishes and does not delete the saved configuration. Changing bodies pairs the matching lens and sensor while preserving personal finishes, engraving, and accessories.

## Commands

| Command                | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `npm ci`               | Install dependencies from the lockfile                         |
| `npm run dev`          | Start the Vite development server                              |
| `npm run build`        | Run TypeScript checks and build into `dist/`                   |
| `npm run preview`      | Preview the production build locally                           |
| `npm run format`       | Format source, configuration, and documentation with Prettier  |
| `npm run lint`         | Check JavaScript, TypeScript, and React code; fail on warnings |
| `npm test`             | Run the automated regression suite                             |
| `npm run check:models` | Inspect the actual model geometry without a browser or GPU     |

To preview a production build:

```bash
npm run build
npm run preview
```

The built app is static and can be served from `dist/`. The current asset paths assume deployment at the domain root; hosting under a subdirectory requires adjusting the Vite base and root-relative asset URLs.

### Formatting and linting

Prettier uses its defaults in `.prettierrc.json`. Generated output, dependencies,
the npm lockfile, and bundled public assets are excluded from formatting.
Run `npx prettier --check .` to check formatting without rewriting files.

`eslint.config.js` uses the recommended JavaScript and TypeScript rules, the core
React Hooks rules (hook ordering and effect dependencies), and Vite Fast Refresh
checks. Browser globals apply to application code; Node globals apply to tests,
scripts, and configuration. `eslint-config-prettier` prevents formatting rules
from conflicting with Prettier. Build output and coverage are ignored.

The setup follows the [typescript-eslint quickstart](https://typescript-eslint.io/getting-started/)
and [Prettier installation guide](https://prettier.io/docs/install).

## Design

The interface uses locally bundled **Anton**, selected as a condensed alternative to the TT Burn Condensed reference. It is not the exact reference font.

| Color       | Hex       | Role                                 |
| ----------- | --------- | ------------------------------------ |
| Pure Black  | `#000000` | Backgrounds                          |
| Cobalt Blue | `#3478F7` | Selected controls and studio accents |
| Tangerine   | `#EC562E` | Primary actions and highlights       |
| Petal Peach | `#F3D2C6` | Text and warm contrast               |

Design references are stored in `public/`: `camera.jpg`, `font-modern.png`, `kleur-modern.png`, and `cut off error.png`. The interface palette is separate from selectable camera finishes; the catalog still includes older finish colors.

The Anton license is included at [public/fonts/Anton-LICENSE.txt](public/fonts/Anton-LICENSE.txt). Anton is the only bundled font.

## Technology and structure

Built with React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, and Lucide icons.

The model is generated from geometry in the project rather than loaded from a GLB file. Materials use local procedural textures; studio reflections come from generated softbox lights. The 3D scene is loaded separately from the main interface, and device pixel ratio is capped at 2.

```text
nova-camera/
├── public/
│   ├── fonts/                 Local fonts and licenses
│   └── ...                    Design references and favicon
├── src/
│   ├── components/            Configurator, Photo Studio, Shot Lab, dialogs
│   ├── data/                  Lens and accessory catalog
│   ├── scene/                 Model geometry, decals, lighting, framing
│   ├── state/                 Configuration, studio controls, scoring, tests
│   ├── styles/                Responsive interface styles
│   ├── App.tsx                Main application layout
│   └── main.tsx               Application entry point
├── index.html
├── package.json
├── plan.md                    Progress, remaining checks, proposed improvements
└── vite.config.ts
```

A7 III retains the internal identifier `N1`. Legacy A7R (`N1R`) and A7C (`N1C`) saves migrate to A7 III while keeping their lens, finishes, engraving, and accessories. X-T50 and D7500 use the separate reference-body geometry in `src/scene/ReferenceBodies.tsx`.

## Accessibility and troubleshooting

Controls include accessible names, visible keyboard focus, and state indicators. Fixed viewpoints provide an alternative to dragging. Reduced-motion preferences disable automatic rotation and the Shot Lab shutter flash.

If the 3D viewer is unavailable, enable hardware acceleration and reload. A lost WebGL context displays a recovery message while leaving configuration controls available. Actual performance depends on the GPU, display resolution, and enabled accessories.

If clipboard copying or fullscreen is unavailable, the app reports it. Shared URLs remain available in the share dialog for manual copying.

For renderer diagnostics, append `?debug=true` to the URL, or `&debug=true` if it already has query parameters. The overlay shows frame rate, draw calls, triangle count, camera position, and configuration state.

## Validation and project status

The latest completed checks passed the production build, all **30 automated tests**, and the CPU scene audit (`npm run check:models`). The audit mounts the actual model components, checks 48 configurations and over 1,500 label placements, verifies thin-panel bounds, screen and selected accessory clearances, and tests all six viewpoints at mobile, desktop, and wide viewport sizes. It uses stubbed texture canvases and does not validate rendered lighting, typography rasterization, or every possible triangle intersection. Bottom serial printing is allowed to be covered by an attached cage. Coverage includes configuration normalization and pricing, URL round trips, storage, independent accessories, camera reset, repeated preset selection, Shot Lab scoring, camera framing, decal geometry, and studio control limits.

Chrome inspection was omitted as requested. Visual acceptance, mobile and fullscreen interactions, lighting quality, and downloaded posters still need browser verification. Passing automated checks does not confirm those visual results.

See [plan.md](plan.md) for the remaining verification checklist and proposed next steps.
