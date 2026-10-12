# NOVA — Camera System

**Your perspective. No limits.**

NOVA is an interactive 3D camera configurator inspired by the Sony Alpha series. Build a camera, explore its components, direct the lighting, and export a product poster—all in the browser.

The camera is a procedural concept model. Product names, specifications, and prices are presentation data; the app has no checkout or backend.

## Quick start

Use Node.js 22.12+ and npm, plus a browser with WebGL 2 and hardware acceleration enabled.

From the project directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The usual port is `5173`; Vite selects another port if it is occupied. No API keys, accounts, or environment variables are required.

## Features

### Interactive camera viewer

- Rotate the model by dragging and zoom with the scroll wheel or pinch gesture.
- Switch between Hero, Front, Back, Top, Side, and Detail viewpoints.
- Explore the separated components with **EXPLODE**, then restore them with **ASSEMBLE**.
- Use Product, Technical, or Cinematic presentation modes.
- Expand the viewer with the fullscreen button.
- Automatic framing accounts for viewport size, lens changes, and accessories. Zoom is constrained to keep the assembly visible.
- Surface-following lens markings, a curved front inscription, and sharp Detail rendering keep the model readable.

### Camera configurator

Customize three concept body variants labeled A7 III, A7R, and A7C, with options for:

- Body color, finish, grip material, and engraving.
- Seven lenses, lens finish, hood, and UV/ND filters.
- Viewfinder, rear screen, sensor, mount, and accent color.
- Cage, top handle, side handle, flash, microphone, monitor, battery grip, strap, and rails.

Prices update as the configuration changes. Handles use independent mounts; selecting a handle or removing the cage leaves other accessory choices unchanged. Clicking model components opens the corresponding configuration section.

### Photo Studio

Open **STUDIO** beside **EXPLODE** to direct your product shot.

| Look | Direction |
| --- | --- |
| Showroom | Soft, neutral light that reveals detail |
| Golden Hour | Warm highlights and deeper shadows |
| Blue Hour | Cool lighting with contrasting warm edges |

Adjust light intensity, start or pause the turntable, and set its speed. **CAPTURE POSTER** downloads a 1920 × 1440 PNG using the current angle, camera name, lens, and lighting look. Poster generation happens locally in the browser.

Studio settings last for the current page session. Configuration links do not include lighting, rotation, or viewpoint settings.

### Shot Lab

Open **SHOT LAB** for an illustrated photography simulator with three challenges: a still life, a moving cyclist, and a night scene. Adjust focus distance, aperture, shutter speed, and ISO, then capture a shot and review the feedback.

Each shot scores up to 100 points: 40 for focus, 40 for exposure, and 20 for motion sharpness. This is a simplified learning simulation and does not access a webcam. Closing the lab resets its progress without changing the configured camera.

## Save and share

The **Details** section provides save, load, and reset actions. Saved configurations use browser `localStorage` and belong to the current browser and origin. Changing the local server port creates a different origin, so a save from another port will not appear there.

**Share Configuration** creates a URL containing the camera configuration. The app attempts to copy it to the clipboard and also displays it in a selectable text field. Recipients need access to the app at the link's address; a `localhost` link is only useful on a machine running the project at that address.

Incoming configuration data is validated before use. Resetting the current configuration does not delete the saved configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript checks and build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the automated regression suite |

To preview a production build:

```bash
npm run build
npm run preview
```

The built app is static and can be served from `dist/`. The current asset paths assume deployment at the domain root; hosting under a subdirectory requires adjusting the Vite base and root-relative asset URLs.

## Design

The interface uses locally bundled **Anton**, selected as a condensed alternative to the TT Burn Condensed reference. It is not the exact reference font.

| Color | Hex | Role |
| --- | --- | --- |
| Pure Black | `#000000` | Backgrounds |
| Cobalt Blue | `#3478F7` | Selected controls and studio accents |
| Tangerine | `#EC562E` | Primary actions and highlights |
| Petal Peach | `#F3D2C6` | Text and warm contrast |

Design references are stored in `public/`: `camera.jpg`, `font-modern.png`, `kleur-modern.png`, and `cut off error.png`. The interface palette is separate from selectable camera finishes; the catalog still includes older finish colors.

The Anton license is included at [public/fonts/Anton-LICENSE.txt](public/fonts/Anton-LICENSE.txt). Other bundled fonts retain their accompanying license or source files.

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

The display names A7 III, A7R, and A7C retain the internal identifiers `N1`, `N1R`, and `N1C` for compatibility with saved configurations. The variants share a procedural body structure.

## Accessibility and troubleshooting

Controls include accessible names, visible keyboard focus, and state indicators. Fixed viewpoints provide an alternative to dragging. Reduced-motion preferences disable automatic rotation and the Shot Lab shutter flash.

If the 3D viewer is unavailable, enable hardware acceleration and reload. A lost WebGL context displays a recovery message while leaving configuration controls available. Actual performance depends on the GPU, display resolution, and enabled accessories.

If clipboard copying or fullscreen is unavailable, the app reports it. Shared URLs remain available in the share dialog for manual copying.

For renderer diagnostics, append `?debug=true` to the URL, or `&debug=true` if it already has query parameters. The overlay shows frame rate, draw calls, triangle count, camera position, and configuration state.

## Validation and project status

The latest completed checks passed the production build and all **21 automated tests**. Coverage includes configuration normalization and pricing, URL round trips, storage, accessory dependencies, Shot Lab scoring, camera framing, decal geometry, and studio control limits.

Browser access was unavailable during the latest changes. Visual acceptance, mobile and fullscreen interactions, lighting quality, and downloaded posters still need browser verification. Passing automated checks does not confirm those visual results.

See [plan.md](plan.md) for the remaining verification checklist and proposed next steps.
