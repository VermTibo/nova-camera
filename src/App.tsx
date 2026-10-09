import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Aperture,
  Box,
  Check,
  Expand,
  Layers3,
  MoveUpRight,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Modal } from "./components/Modal";
import Configurator from "./components/Configurator";
import PhotoStudio from "./components/PhotoStudio";
import { useStudio } from "./state/studioStore";
import ShotLab from "./components/ShotLab";
import { useCamera, type Mode, type View } from "./state/cameraStore";
import { shareUrl } from "./state/configuration";
import { bodyNames, colors, lenses } from "./data/catalog";
const Studio = lazy(() => import("./scene/Studio"));
export default function App() {
  const lighting = useStudio(s => s.look);
  const { config, mode, setMode, view, setView, notice, notify, ready } =
    useCamera();
  const [sound, setSound] = useState(false),
    [shotLab, setShotLab] = useState(false),
    [share, setShare] = useState(""),
    [copied, setCopied] = useState(false);
  const lens = lenses.find((l) => l.id === config.lens)!;
  const color = colors.find((c) => c.hex === config.color)?.name || "Custom";
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => notify(""), 4200);
    return () => clearTimeout(t);
  }, [notice, notify]);
  useEffect(() => {
    if (!sound) return;
    let context: AudioContext | undefined;
    const listener = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("button")) return;
      try {
        context ??= new AudioContext();
        const osc = context.createOscillator(),
          gain = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(780, context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          320,
          context.currentTime + 0.035,
        );
        gain.gain.setValueAtTime(0.025, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime + 0.055,
        );
        osc.connect(gain).connect(context.destination);
        osc.start();
        osc.stop(context.currentTime + 0.06);
      } catch {
        /* Audio is optional. */
      }
    };
    document.addEventListener("click", listener);
    return () => {
      document.removeEventListener("click", listener);
      void context?.close();
    };
  }, [sound]);
  const doShare = async () => {
    const url = shareUrl(config, window.location.href);
    setShare(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify("Configuration link copied");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShare(url);
    }
  };
  return (
    <div className="app-shell">
      <header className="main-header">
        <a href="/" className="wordmark" aria-label="NOVA Camera System">
          NOVA<span>CAMERA SYSTEM</span>
        </a>
        <div className="header-center">
          <span className="status-dot" /> THE ALPHA EDITION{" "}
          <span className="header-divider">/</span> BUILT AROUND YOU
        </div>
        <div className="header-actions">
        <button className="shot-lab-button" aria-label="Open Shot Lab" onClick={() => setShotLab(true)}><Aperture size={18} /><span>SHOT LAB</span><span className="play-tag">PLAY</span></button>
        <button className="share-button" aria-label="Share configuration" onClick={doShare}>
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          <span>{copied ? "LINK COPIED" : "SHARE CONFIGURATION"}</span>
          <ArrowUpRight size={15} />
        </button>
        </div>
      </header>
      <main className="workspace">
        <section
          className={`stage mode-${mode.toLowerCase()}`}
          aria-label="Interactive 3D camera viewer"
          data-lighting={lighting}
        >
          <div className="stage-heading">
            <div className="eyebrow">
              <span className="tiny-square" /> SONY ALPHA / REIMAGINED BY NOVA
            </div>
            <h1>
              SONY <span>{bodyNames[config.body]}.</span>
            </h1>
            <p>Your perspective. No limits.</p>
          </div>
          <div className="edition-mark">
            ENGINEERED
            <br />
            WITHOUT LIMITS.<span>001 / ALPHA SERIES</span>
          </div>
          <div className="background-type" aria-hidden="true">
            NOVA
          </div>
          <div className="canvas-wrap">
            <Suspense
              fallback={
                <div className="loading-screen">
                  <span>NOVA CAMERA SYSTEM</span>
                  <i />
                  <p>INITIALIZING OPTICS</p>
                </div>
              }
            >
              <Studio paused={shotLab} />
            </Suspense>
          </div>
          {!ready && (
            <div className="initializing" role="status">
              INITIALIZING OPTICS <span />
            </div>
          )}
          <div className="stage-top-actions">
            <PhotoStudio />
            <button
              className={mode === "Exploded" ? "active" : ""}
              onClick={() =>
                setMode(mode === "Exploded" ? "Product" : "Exploded")
              }
              aria-pressed={mode === "Exploded"}
            >
              <Layers3 size={16} />
              {mode === "Exploded" ? "ASSEMBLE" : "EXPLODE"}
            </button>
            <button
              aria-label="Reset camera view"
              onClick={() => setView("Hero")}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="product-caption">
            <span className="caption-line" />
            <div>
              <strong>
                SONY {bodyNames[config.body]} <span>/</span> {color.toUpperCase()}
              </strong>
              <small>
                FE {lens.name.toUpperCase()} F/{lens.aperture} <span>—</span> G MASTER
              </small>
            </div>
          </div>
          {mode === "Technical" && (
            <div className="technical-caption">
              SHELL / MAGNESIUM ALLOY
              <br />
              SENSOR / 36 × 24 MM
              <br />
              MOUNT / {config.mount.toUpperCase()}
              <br />
              SCALE / 1:1 REFERENCE
            </div>
          )}
          <div className="viewer-tools">
            <div className="view-presets" aria-label="Camera viewpoints">
              {(
                ["Hero", "Front", "Back", "Top", "Side", "Detail"] as View[]
              ).map((v) => (
                <button
                  key={v}
                  aria-label={v === "Hero" ? "Hero view" : v}
                  aria-pressed={view === v}
                  className={view === v ? "active" : ""}
                  onClick={() => setView(v)}
                >
                  {v === "Hero" ? <Box size={15} /> : v}
                </button>
              ))}
            </div>
            <button
              className="fullscreen-button"
              aria-label="Toggle fullscreen"
              onClick={async (event) => {
                try {
                  if (document.fullscreenElement)
                    await document.exitFullscreen();
                  else await event.currentTarget.closest(".stage")?.requestFullscreen();
                } catch {
                  notify("Fullscreen is unavailable in this browser");
                }
              }}
            >
              <Expand size={17} />
            </button>
          </div>
          <div className="stage-bottom">
            <span>
              <MoveUpRight size={14} /> DRAG TO ROTATE <b>·</b> SCROLL TO ZOOM
            </span>
            <button
              onClick={() => setSound(!sound)}
              aria-label={sound ? "Mute sound" : "Enable sound"}
              aria-pressed={sound}
            >
              {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} SOUND{" "}
              {sound ? "ON" : "OFF"}
            </button>
          </div>
        </section>
        <Configurator />
      </main>
      <footer className="global-footer">
        <span>
          NOVA® <span>AN INDEPENDENT PERSPECTIVE.</span>
        </span>
        <nav aria-label="Presentation mode">
          {(["Product", "Technical", "Cinematic"] as Mode[]).map((m) => (
            <button
              className={mode === m ? "active" : ""}
              aria-pressed={mode === m}
              key={m}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </nav>
        <span className="render-status">
          <i /> REALTIME 3D <span>/</span>{" "}
          {ready ? "SYSTEM READY" : "CONNECTING"}
        </span>
      </footer>
      {shotLab && <ShotLab onClose={() => setShotLab(false)} />}
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
      {share && (
        <Modal label="Share configuration" onClose={() => setShare("")}>
          <div className="share-content">
            <h3>Your configuration link</h3>
            <p>
              {copied
                ? "Link copied. Open it to restore this exact system."
                : "Copy this link to reopen this exact system."}
            </p>
            <textarea
              aria-label="Configuration URL"
              readOnly
              value={share}
              onFocus={(e) => e.currentTarget.select()}
              autoFocus
            />
            <button className="primary-button" onClick={() => setShare("")}>
              Done
            </button>
          </div>
        </Modal>
      )}
      {new URLSearchParams(window.location.search).get("debug") === "true" && (
        <pre className="debug">
          {JSON.stringify({ view, mode, ready, config }, null, 2)}
        </pre>
      )}
    </div>
  );
}
