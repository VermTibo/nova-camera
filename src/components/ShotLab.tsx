import { useState, type CSSProperties } from 'react';
import { Aperture, ArrowRight, Camera, Check, HelpCircle, RotateCcw, Trophy, X } from 'lucide-react';
import { Modal } from './Modal';
import { apertures, assessShot, challenges, isos, shutters, type Challenge, type ShotSettings } from '../state/shotLab';
import '../styles/shot-lab.css';

function Scene({ challenge, settings }: { challenge: Challenge; settings: ShotSettings }) {
  const { exposureError, focusError, motionError } = assessShot(settings, challenge);
  const style = {
    '--light': Math.max(.12, Math.min(2.7, 2 ** (-exposureError * .42))),
    '--blur': `${Math.min(8, focusError * 1.7)}px`,
    '--bokeh': `${Math.max(0, 7 - settings.aperture) / 2}px`,
  } as CSSProperties;
  return <div className="lab-scene" style={style}>
    <svg viewBox="0 0 800 520" role="img" aria-label={`${challenge.subject} camera preview; subject at ${challenge.distance} metres`}>
      <defs>
        <linearGradient id="lab-wall" x2="0" y2="1"><stop stopColor={challenge.scene === 'night' ? '#000000' : '#3478f7'} /><stop offset="1" stopColor="#000000" /></linearGradient>
        <linearGradient id="lab-vase"><stop stopColor="#762b17" /><stop offset=".4" stopColor="#ec562e" /><stop offset="1" stopColor="#a83d20" /></linearGradient>
        <radialGradient id="lab-glow"><stop stopColor="#ec562e" stopOpacity=".5" /><stop offset="1" stopColor="#ec562e" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="800" height="520" fill="url(#lab-wall)" />
      <g className="lab-background">
        {challenge.scene === 'still' ? <>
          <rect x="90" y="50" width="230" height="320" rx="110" fill="#3478f7" opacity=".36" />
          <path d="M580 20V360M650 20V360M720 20V360" stroke="#f3d2c6" opacity=".2" strokeWidth="2" />
          <circle cx="610" cy="110" r="55" fill="#edc5a6" opacity=".6" />
          <path d="M0 377H800V520H0Z" fill="#c7bbaa" />
          <path d="M0 392H800" stroke="#e5d9c8" strokeWidth="5" />
        </> : <>
          {[0, 1, 2, 3, 4, 5].map(i => <g key={i}>
            <rect x={i * 150 - 35} y={55 + (i % 3) * 27} width="135" height="330" fill={i % 2 ? '#182d57' : '#10203e'} />
            {[0, 1, 2].map(j => <rect key={j} x={i * 150} y={95 + j * 80} width="37" height="47" fill={challenge.scene === 'night' ? '#dab36c' : '#78938d'} opacity={.3 + ((i + j) % 2) * .4} />)}
          </g>)}
          <path d="M0 390H800V520H0Z" fill="#101010" />
          <path d="M0 430H800M70 480H210M330 480H470M590 480H730" stroke="#78938d" strokeWidth="4" opacity=".5" />
        </>}
      </g>
      <g className="lab-subject">
        {challenge.scene === 'still' && <>
          <ellipse cx="411" cy="416" rx="122" ry="21" fill="#000000" opacity=".25" />
          <path d="M380 248C379 280 333 293 337 349L347 399Q400 426 453 399L463 349C467 293 421 280 420 248Z" fill="url(#lab-vase)" />
          <ellipse cx="400" cy="249" rx="20" ry="7" fill="#f3d2c6" />
          <path d="M400 255Q390 150 342 100M402 250Q415 126 458 87M397 215L357 170" fill="none" stroke="#abc7a5" strokeWidth="5" />
          <path d="M343 101Q288 95 303 57Q347 53 343 101M432 133Q481 131 479 96Q435 91 432 133M373 180Q320 183 334 145Q374 143 373 180" fill="#759d81" />
        </>}
        {challenge.scene === 'motion' && <g>
          {motionError > 0 && <g opacity=".2" transform={`translate(${-motionError * 12} 0)`}><circle cx="322" cy="367" r="55" fill="#d9ede6" /><circle cx="496" cy="367" r="55" fill="#d9ede6" /><path d="M370 180L425 320" stroke="#ec562e" strokeWidth="55" /></g>}
          <circle cx="322" cy="367" r="55" fill="none" stroke="#d9ede6" strokeWidth="7" /><circle cx="496" cy="367" r="55" fill="none" stroke="#d9ede6" strokeWidth="7" />
          <path d="M322 367L367 284L409 367H322L461 295L496 367M409 367L380 270M354 270H399M448 268L461 295L484 281" fill="none" stroke="#ec562e" strokeWidth="8" strokeLinejoin="round" />
          <path d="M400 229L367 287L414 312L402 365M410 218L442 265L466 270" fill="none" stroke="#e9d2b7" strokeWidth="15" strokeLinecap="round" />
          <path d="M380 211L419 198L432 250L384 257Z" fill="#ec562e" />
          <circle cx="415" cy="176" r="22" fill="#e9d2b7" /><path d="M389 175Q410 134 440 171Z" fill="#f5f0df" />
        </g>}
        {challenge.scene === 'night' && <>
          <ellipse cx="400" cy="310" rx="230" ry="245" fill="url(#lab-glow)" />
          <rect x="310" y="165" width="180" height="231" fill="#000000" stroke="#ec562e" strokeWidth="10" />
          <rect x="317" y="172" width="166" height="220" fill="none" stroke="#f3d2c6" strokeWidth="3" />
          <rect x="331" y="185" width="138" height="200" fill="#182d57" />
          <path d="M400 185V385M341 290H384M416 290H458" stroke="#c99383" strokeWidth="3" />
          <rect x="330" y="116" width="140" height="29" rx="14" fill="#ec562e" />
          <path d="M320 422L280 490M480 422L520 490" stroke="#ec562e" opacity=".35" strokeWidth="13" />
        </>}
      </g>
    </svg>
  </div>;
}

function Setting({ label, value, min, max, step = 1, output, disabled, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; output: string; disabled: boolean; onChange: (value: number) => void;
}) {
  return <label className="lab-setting"><span>{label}<output>{output}</output></span>
    <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={label} aria-valuetext={output} onChange={e => onChange(Number(e.target.value))} />
  </label>;
}

export default function ShotLab({ onClose }: { onClose: () => void }) {
  const [round, setRound] = useState(0);
  const [settings, setSettings] = useState<ShotSettings>({ ...challenges[0].initial });
  const [result, setResult] = useState<ReturnType<typeof assessShot> | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const challenge = challenges[Math.min(round, challenges.length - 1)];
  const live = assessShot(settings, challenge);
  const done = round === challenges.length;
  const total = Math.round(scores.reduce((sum, score) => sum + score, 0) / challenges.length);
  const update = (key: keyof ShotSettings, value: number) => setSettings(s => ({ ...s, [key]: value }));
  const restart = () => { setRound(0); setScores([]); setResult(null); setShowHint(false); setSettings({ ...challenges[0].initial }); };
  const next = () => {
    if (!result) return;
    setScores(s => [...s, result.score]); setResult(null); setShowHint(false);
    const nextRound = round + 1; setRound(nextRound);
    if (nextRound < challenges.length) setSettings({ ...challenges[nextRound].initial });
  };
  return <Modal label="Shot Lab camera challenge" className="shot-lab-modal" onClose={onClose}>
    <header className="lab-header"><div><span className="eyebrow"><Aperture size={16} /> NOVA / PLAY & LEARN</span><h2>Shot Lab<span>.</span></h2></div>
      <button className="lab-close" aria-label="Close Shot Lab" onClick={onClose} autoFocus><X size={23} /></button>
    </header>
    {done ? <div className="lab-complete">
      <Trophy size={45} /><p className="eyebrow">THREE SCENES. YOUR PERSPECTIVE.</p>
      <h3>{total >= 85 ? 'A natural behind the lens.' : total >= 60 ? 'Your eye is getting sharper.' : 'Every frame is practice.'}</h3>
      <div className="lab-final-score">{total}<small>/ 100</small></div>
      <div className="lab-scorecards">{challenges.map((c, i) => <div key={c.scene}><span>0{i + 1} / {c.subject}</span><strong>{scores[i]}<small>/100</small></strong></div>)}</div>
      <p>Focus chooses what is sharp. Aperture, shutter speed and ISO work together to control the light.</p>
      <div className="lab-result-actions"><button className="primary-button" onClick={restart}><RotateCcw size={17} /> Play again</button><button className="lab-secondary" onClick={onClose}>Back to your camera <ArrowRight size={17} /></button></div>
    </div> : <>
      <div className="lab-progress" aria-label={`Challenge ${round + 1} of 3`}>{challenges.map((c, i) => <span className={i === round ? 'current' : i < round ? 'completed' : ''} key={c.scene}>{i < round ? <Check size={13} /> : `0${i + 1}`} {c.subject}</span>)}</div>
      <div className="lab-layout">
        <div className="lab-view-column">
          <div className={`lab-viewfinder ${result ? 'captured' : ''}`}>
            <Scene challenge={challenge} settings={settings} />
            <div className="lab-view-top"><span>{result ? 'PHOTO CAPTURED' : 'LIVE VIEW'}</span><span>MANUAL / 3:2</span></div>
            <div className="lab-grid" aria-hidden="true" />
            <div className={`lab-focus ${live.focusError <= .3 ? 'locked' : ''}`} aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="lab-view-bottom"><span>F{settings.aperture} &nbsp; 1/{settings.shutter} &nbsp; ISO {settings.iso}</span><span>{settings.focus.toFixed(1)}m</span></div>
            {result && <div className="lab-capture-score" role="status">{result.score}<small>/100</small></div>}
          </div>
          <div className="lab-meter"><span>−3</span><div><i style={{ left: `${50 - Math.max(-3, Math.min(3, live.exposureError)) / 6 * 100}%` }} /><b /></div><span>+3</span><strong>{Math.abs(live.exposureError) <= .5 ? 'Balanced' : live.exposureError > 0 ? 'Underexposed' : 'Overexposed'}</strong></div>
          <p className="lab-simulation-note">Illustrated simulator · no webcam needed · centre the exposure meter</p>
        </div>
        <div className="lab-controls">
          <span className="eyebrow">CHALLENGE 0{round + 1} / 03</span><h3>{challenge.title}</h3><p className="lab-brief">{challenge.brief}</p>
          {!result ? <>
            <Setting label="Focus distance" min={.5} max={10} step={.1} value={settings.focus} output={`${settings.focus.toFixed(1)} m`} disabled={false} onChange={v => update('focus', v)} />
            <Setting label="Aperture" min={0} max={apertures.length - 1} value={apertures.indexOf(settings.aperture)} output={`f/${settings.aperture}`} disabled={false} onChange={v => update('aperture', apertures[v])} />
            <Setting label="Shutter speed" min={0} max={shutters.length - 1} value={shutters.indexOf(settings.shutter)} output={`1/${settings.shutter} s`} disabled={false} onChange={v => update('shutter', shutters[v])} />
            <Setting label="ISO" min={0} max={isos.length - 1} value={isos.indexOf(settings.iso)} output={String(settings.iso)} disabled={false} onChange={v => update('iso', isos[v])} />
            <button className="lab-hint-button" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}><HelpCircle size={15} /> {showHint ? 'Hide tip' : 'Need a shooting tip?'}</button>
            {showHint && <p className="lab-hint">{challenge.hint}</p>}
            <button className="primary-button lab-shutter" onClick={() => setResult(assessShot(settings, challenge))}><Camera size={20} /> Take the shot <span>0{round + 1}</span></button>
          </> : <div className="lab-feedback" aria-live="polite">
            <h4>{result.score >= 85 ? 'That’s a keeper.' : 'Let’s look at your shot.'}</h4>
            {result.feedback.map((text, i) => <p key={text}><span>{['FOCUS', 'EXPOSURE', 'SHARPNESS'][i]} <b>{[result.focus, result.exposure, result.motion][i]}/{[40, 40, 20][i]}</b></span>{text}</p>)}
            <button className="primary-button" onClick={next}>{round === 2 ? 'See your results' : 'Next challenge'}<ArrowRight size={18} /></button>
            <button className="lab-secondary" onClick={() => setResult(null)}><RotateCcw size={15} /> Adjust & try again</button>
          </div>}
        </div>
      </div>
    </>}
  </Modal>;
}
