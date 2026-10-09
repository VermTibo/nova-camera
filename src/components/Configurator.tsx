import { Modal } from "./Modal";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  X,
} from "lucide-react";
import {
  bodyNames,
  colors,
  lenses,
  accessoryCatalog,
  money,
  type Accessory,
} from "../data/catalog";
import { useCamera, type Section } from "../state/cameraStore";
import { price } from "../state/configuration";
const sections: Section[] = [
  "Body",
  "Lens",
  "View",
  "Handling",
  "Accessories",
  "Details",
];
function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <div className="segments">
        {options.map((option) => (
          <button
            key={option}
            aria-pressed={value === option}
            className={value === option ? "selected" : ""}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
function Toggle({
  title,
  detail,
  on,
  onClick,
  amount,
}: {
  title: string;
  detail?: string;
  on: boolean;
  onClick: () => void;
  amount?: number;
}) {
  return (
    <button
      className={`toggle-row ${on ? "is-on" : ""}`}
      role="switch"
      aria-checked={on}
      onClick={onClick}
    >
      <span>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <span className="toggle-end">
        {amount !== undefined && <small>+{money(amount)}</small>}
        <span className="switch">
          <i />
        </span>
      </span>
    </button>
  );
}
export default function Configurator() {
  const {
    config: c,
    set,
    section,
    select,
    toggle,
    reset,
    save,
    load,
  } = useCamera();
  const [confirm, setConfirm] = useState(false),
    [summary, setSummary] = useState(false),
    [expanded, setExpanded] = useState(false);
  const start = useRef(0);
  const dragged = useRef(false);
  const chosenLens = lenses.find((l) => l.id === c.lens)!;
  const name =
    colors.find((v) => v.hex.toLowerCase() === c.color.toLowerCase())?.name ||
    "Custom";
  const accessories = (keys: Accessory[]) =>
    keys.map((k) => (
      <Toggle
        key={k}
        title={accessoryCatalog[k].name}
        detail={accessoryCatalog[k].detail}
        on={c.accessories[k]}
        onClick={() => toggle(k)}
        amount={accessoryCatalog[k].price}
      />
    ));
  return (
    <aside
      className={`configurator ${expanded ? "expanded" : ""}`}
      aria-label="Camera configurator"
    >
      <button
        className="sheet-handle"
        aria-label={
          expanded
            ? "Collapse configuration panel"
            : "Expand configuration panel"
        }
        onClick={() => {
          if (!dragged.current) setExpanded(!expanded);
        }}
        onPointerDown={(e) => {
          dragged.current = false;
          start.current = e.clientY;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (Math.abs(e.clientY - start.current) > 25) {
            dragged.current = true;
            setExpanded(e.clientY < start.current);
          }
        }}
      >
        <span />
      </button>
      <div className="config-title">
        <span className="eyebrow">MAKE IT YOURS</span>
        <span className="step-count">
          0{sections.indexOf(section) + 1} <span>/ 06</span>
        </span>
        <h2>
          Your vision.
          <br /> Your system.
        </h2>
      </div>
      <nav className="category-tabs" aria-label="Configuration categories">
        {sections.map((s, i) => (
          <button
            key={s}
            className={section === s ? "active" : ""}
            aria-pressed={section === s}
            onClick={() => select(s)}
          >
            <span>0{i + 1}</span>
            {s}
          </button>
        ))}
      </nav>
      <div className="config-scroll" key={section}>
        <div className="section-heading">
          <h3>
            {section === "Body"
              ? "The foundation."
              : section === "Lens"
                ? "A different perspective."
                : section === "View"
                  ? "See it your way."
                  : section === "Handling"
                    ? "Made for your hands."
                    : section === "Accessories"
                      ? "Expand your possibilities."
                      : "Every detail matters."}
          </h3>
          <p>
            {
              {
                Body: "Precision engineered. Uniquely yours.",
                Lens: "Exceptional clarity, at every focal length.",
                View: "A direct connection to your subject.",
                Handling: "Balance, comfort and complete control.",
                Accessories: "A modular system. Ready for anything.",
                Details: "The finishing touches that make it yours.",
              }[section]
            }
          </p>
        </div>
        {section === "Body" && (
          <>
            <fieldset className="field">
              <legend>CAMERA BODY</legend>
              <div className="body-options">
                {(["N1", "N1R", "N1C"] as const).map((body, i) => (
                  <button
                    key={body}
                    className={`body-option ${c.body === body ? "selected" : ""}`}
                    onClick={() => set("body", body)}
                    aria-pressed={c.body === body}
                  >
                    <span>
                      <strong>SONY {bodyNames[body]}</strong>
                      <small>
                        {
                          [
                            "The original · Full frame",
                            "Resolution · Every detail",
                            "Compact · Create anywhere",
                          ][i]
                        }
                      </small>
                    </span>
                    <span>
                      {c.body === body ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend>
                BODY COLOR <span>{name}</span>
              </legend>
              <div className="swatches">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    style={{ "--swatch": color.hex } as React.CSSProperties}
                    className={`swatch ${c.color === color.hex ? "chosen" : ""}`}
                    aria-label={color.name}
                    title={color.name}
                    aria-pressed={c.color === color.hex}
                    onClick={() => set("color", color.hex)}
                  >
                    {c.color === color.hex && <Check size={16} />}
                  </button>
                ))}
                <label className="custom-swatch" title="Custom body color">
                  <Plus size={19} />
                  <input
                    type="color"
                    aria-label="Custom body color"
                    value={c.color}
                    onChange={(e) => set("color", e.target.value)}
                  />
                </label>
              </div>
              <div className="color-caption">
                <span>
                  {name} / {c.finish.toLowerCase()} finish
                </span>
                <span>01—04 + CUSTOM</span>
              </div>
            </fieldset>
            <Choices
              label="SURFACE FINISH"
              options={["Satin", "Matte", "Brushed"]}
              value={c.finish}
              onChange={(v) => set("finish", v)}
            />
            <Choices
              label="GRIP MATERIAL"
              options={["Rubber", "Leather", "Walnut"]}
              value={c.grip}
              onChange={(v) => set("grip", v)}
            />
          </>
        )}
        {section === "Lens" && (
          <>
            <fieldset className="field">
              <legend>
                SONY FE OPTICS <span>7 precision lenses</span>
              </legend>
              <div className="lens-options">
                {lenses.map((l) => (
                  <button
                    className={c.lens === l.id ? "selected" : ""}
                    key={l.id}
                    onClick={() => set("lens", l.id)}
                    aria-pressed={c.lens === l.id}
                  >
                    <strong>{l.name}</strong>
                    <small>
                      {l.type} · ƒ/{l.aperture}
                    </small>
                    <span>{money(l.price)}</span>
                    {c.lens === l.id && <Check size={15} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <Choices
              label="LENS FINISH"
              options={["Obsidian", "Silver"]}
              value={c.lensFinish}
              onChange={(v) => set("lensFinish", v)}
            />
            <Toggle
              title="Lens hood"
              detail="Flared metal · stray-light protection"
              amount={90}
              on={c.hood}
              onClick={() => set("hood", !c.hood)}
            />
            <Choices
              label="OPTICAL FILTER"
              options={["None", "UV", "ND"]}
              value={c.filter}
              onChange={(v) => set("filter", v)}
            />
          </>
        )}
        {section === "View" && (
          <>
            <Choices
              label="VIEWFINDER"
              options={["Standard", "Cinema", "None"]}
              value={c.viewfinder}
              onChange={(v) => set("viewfinder", v)}
            />
            <Choices
              label="REAR DISPLAY"
              options={["Flush", "Articulated"]}
              value={c.screen}
              onChange={(v) => {
                set("screen", v);
                useCamera.getState().setView("Back");
              }}
            />
            <Choices
              label="SENSOR"
              options={["Full frame", "Monochrome"]}
              value={c.sensor}
              onChange={(v) => set("sensor", v)}
            />
            <div className="spec-card">
              <span>EVERY FRAME. EVERY DETAIL.</span>
              <strong>
                {c.body === "N1R" ? "61" : c.body === "N1C" ? "48" : "45"}
                <small> MP</small>
              </strong>
              <p>
                {c.sensor} · Backside illuminated
                <br />
                15-stop dynamic range · In-body stabilization
              </p>
            </div>
          </>
        )}
        {section === "Handling" && (
          <>
            <Choices
              label="GRIP MATERIAL"
              options={["Rubber", "Leather", "Walnut"]}
              value={c.grip}
              onChange={(v) => set("grip", v)}
            />
            {accessories(["topHandle", "sideHandle", "strap", "batteryGrip"])}
          </>
        )}
        {section === "Accessories" && (
          <>
            {accessories([
              "cage",
              "flash",
              "microphone",
              "monitor",
              "batteryGrip",
              "rails",
            ])}
            <p className="field-note">
              Handles include the precision cage. Flash and microphone use
              separate mounts when combined.
            </p>
          </>
        )}
        {section === "Details" && (
          <>
            <fieldset className="field">
              <legend>CONTROL & RING ACCENT</legend>
              <div className="swatches">
                {["#3478f7", "#ec562e", "#f3d2c6", "#000000"].map(
                  (hex) => (
                    <button
                      key={hex}
                      className={`swatch ${hex === c.accent ? "chosen" : ""}`}
                      style={{ "--swatch": hex } as React.CSSProperties}
                      aria-label={`Accent ${hex}`}
                      aria-pressed={hex === c.accent}
                      onClick={() => set("accent", hex)}
                    >
                      {hex === c.accent && <Check size={16} />}
                    </button>
                  ),
                )}
              </div>
            </fieldset>
            <Choices
              label="LENS MOUNT"
              options={["N mount", "PL adapter"]}
              value={c.mount}
              onChange={(v) => set("mount", v)}
            />
            <label className="field engraving">
              <span>
                PERSONAL ENGRAVING <small>{c.engraving.length}/18</small>
              </span>
              <input
                value={c.engraving}
                maxLength={18}
                placeholder="YOUR NAME OR STUDIO"
                onChange={(e) => set("engraving", e.target.value)}
                aria-label="Personal engraving"
              />
              <small>Precision etched on the front top plate.</small>
            </label>
            <div className="storage-actions">
              <button onClick={save}>
                Save configuration <Plus size={15} />
              </button>
              <button onClick={load}>
                Load saved configuration <ArrowUpRight size={15} />
              </button>
            </div>
          </>
        )}
        <div className="module-note">
          <span className="module-mark">N</span>
          <p>
            One system. Endless possibilities.
            <br />
            <span>Every component, working as one.</span>
          </p>
        </div>
      </div>
      <footer className="config-footer">
        <button
          className="summary-toggle"
          aria-expanded={summary}
          onClick={() => setSummary(!summary)}
        >
          <span>YOUR CONFIGURATION</span>
          {summary ? <Minus size={15} /> : <Plus size={15} />}
        </button>
        {summary && (
          <div className="summary">
            <div>
              <span>
                SONY {bodyNames[c.body]} · {name}
              </span>
              <span>{money({ N1: 3290, N1R: 4290, N1C: 4890 }[c.body])}</span>
            </div>
            <div>
              <span>
                {chosenLens.name} ƒ/{chosenLens.aperture}
              </span>
              <span>{money(chosenLens.price)}</span>
            </div>
            {Object.entries(c.accessories)
              .filter(([, v]) => v)
              .map(([k]) => (
                <div key={k}>
                  <span>{accessoryCatalog[k as Accessory].name}</span>
                  <span>{money(accessoryCatalog[k as Accessory].price)}</span>
                </div>
              ))}
            {(
              [
                [c.hood ? "Lens hood" : "", 90],
                [
                  c.filter !== "None" ? c.filter + " filter" : "",
                  c.filter === "ND" ? 150 : 60,
                ],
                [
                  c.grip !== "Rubber" ? c.grip + " grip" : "",
                  c.grip === "Walnut" ? 180 : 90,
                ],
                [c.mount === "PL adapter" ? "PL adapter" : "", 320],
                [c.viewfinder === "Cinema" ? "Cinema viewfinder" : "", 290],
                [c.sensor === "Monochrome" ? "Monochrome sensor" : "", 400],
              ] as [string, number][]
            )
              .filter(([label]) => label)
              .map(([label, cost]) => (
                <div key={label}>
                  <span>{label}</span>
                  <span>{money(cost)}</span>
                </div>
              ))}
            <p>
              {c.finish} · {c.grip} ·{" "}
              {c.filter === "None" ? "No filter" : c.filter + " filter"}
              {c.hood ? " · Lens hood" : ""}
            </p>
          </div>
        )}
        <div className="total-line">
          <div>
            <strong>{money(price(c))}</strong>
            <span>Concept system · indicative price</span>
          </div>
          <button
            className="review-button"
            aria-label="Review configuration"
            onClick={() => setSummary(!summary)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
        <div className="footer-meta">
          <span>DESIGNED FOR THE WAY YOU SEE.</span>
          <button
            onClick={() => setConfirm(true)}
            aria-label="Reset configuration"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </footer>
      {confirm && (
        <Modal label="Reset configuration" onClose={() => setConfirm(false)}>
          <div className="reset-content">
            <button
              className="close-dialog"
              aria-label="Cancel reset"
              onClick={() => setConfirm(false)}
              autoFocus
            >
              <X size={19} />
            </button>
            <span className="eyebrow">A FRESH PERSPECTIVE</span>
            <h3 id="reset-title">Start again?</h3>
            <p>
              Return to the original Sony A7 III configuration. Your saved
              configuration stays available.
            </p>
            <button
              className="primary-button"
              onClick={() => {
                reset();
                setConfirm(false);
              }}
            >
              Reset configuration <RotateCcw size={16} />
            </button>
            <button className="text-button" onClick={() => setConfirm(false)}>
              Keep my configuration
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
}
