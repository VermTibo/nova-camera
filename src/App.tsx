import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Gamepad2,
  CircleHelp,
  Box,
  Camera,
  PanelTop,
  PanelLeft,
  RectangleHorizontal,
  ScanSearch,
  Check,
  Expand,
  Layers3,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Modal } from "./components/Modal";
import Welcome from "./components/Welcome";
import Configurator from "./components/Configurator";
import PhotoStudio from "./components/PhotoStudio";
import { useStudio } from "./state/studioStore";
import ShotLab from "./components/ShotLab";
import { useCamera, type Mode, type View } from "./state/cameraStore";
import { shareUrl } from "./state/configuration";
import { bodyNames } from "./data/catalog";
const viewIcons = { Hero: Box, Front: Camera, Back: RectangleHorizontal, Top: PanelTop, Side: PanelLeft, Detail: ScanSearch };
const Studio = lazy(() => import("./scene/Studio"));
export default function App() {
  const helpButton = useRef<HTMLButtonElement>(null);
  const [welcome, setWelcome] = useState(() => {
    try { return localStorage.getItem("nova-welcome-v1") !== "seen"; }
    catch { return true; }
  });
  const closeWelcome = () => {
    try { localStorage.setItem("nova-welcome-v1", "seen"); } catch { /* Guide remains usable without storage. */ }
    setWelcome(false);
    requestAnimationFrame(() => helpButton.current?.focus());
  };
  const lighting = useStudio(s => s.look);
  const { config, mode, setMode, view, setView, resetView, notice, notify, ready } =
    useCamera();
  const [shotLab, setShotLab] = useState(false),
    [share, setShare] = useState(""),
    [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => notify(""), 4200);
    return () => clearTimeout(t);
  }, [notice, notify]);
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
          NOVA
        </a>
        <div className="header-actions">
        <button ref={helpButton} className="help-button" aria-label="How to use NOVA" title="How to use NOVA" onClick={() => setWelcome(true)}><CircleHelp size={20} /></button>
        <button className="shot-lab-button" aria-label="Play Shot Lab photography game" onClick={() => setShotLab(true)}><Gamepad2 size={21} /><span className="game-button-copy"><strong>PLAY GAME</strong></span></button>
        <button className="share-button" aria-label="Share configuration" title="Share configuration" onClick={doShare}>
          {copied ? <Check size={15} /> : <Share2 size={15} />}
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
            <h1>
              SONY <span>{bodyNames[config.body]}.</span>
            </h1>
          </div>
          <div className="nova-backdrop" aria-hidden="true">NOVA</div>
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
            <details className="viewer-options" onKeyDown={event => {
              if (event.key === "Escape") {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
              }
            }} onClick={event => {
              if ((event.target as HTMLElement).closest("button")) {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
              }
            }}>
              <summary>More</summary>
              <div className="viewer-options-panel">
                <button onClick={() => setMode(mode === "Exploded" ? "Product" : "Exploded")} aria-pressed={mode === "Exploded"}>
                  <Layers3 size={16} /> {mode === "Exploded" ? "Assemble" : "Explode"}
                </button>
                {(["Product", "Technical", "Cinematic"] as Mode[]).map(m => (
                  <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>
                ))}
              </div>
            </details>
          </div>
          <div className="viewer-tools">
            <div className="view-presets" aria-label="Camera viewpoints">
              {(
                ["Hero", "Front", "Back", "Top", "Side", "Detail"] as View[]
              ).map((v) => {
                const Icon = viewIcons[v];
                return <button
                  key={v}
                  aria-label={`${v} view`}
                  title={`${v} view`}
                  aria-pressed={view === v}
                  className={view === v ? "active" : ""}
                  onClick={() => setView(v)}
                >
                  <Icon size={20} aria-hidden="true" />
                </button>;
              })}
            </div>
            <button className="reset-camera-button" onClick={resetView} title="Reset camera view and zoom">
              <RotateCcw size={17} aria-hidden="true" /> Reset camera
            </button>
            <button
              className="fullscreen-button"
              aria-label="Toggle fullscreen"
              title="Toggle fullscreen"
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
        </section>
        <Configurator />
      </main>
      {welcome && <Welcome onClose={closeWelcome} />}
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
