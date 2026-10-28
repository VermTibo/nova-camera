import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, Download, Pause, Play, SlidersHorizontal, X } from 'lucide-react';
import { lightingLooks, useStudio, type LightingLook } from '../state/studioStore';
import { useCamera } from '../state/cameraStore';
import { bodyNames, lenses } from '../data/catalog';
import '../styles/photo-studio.css';

export default function PhotoStudio() {
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const studio = useStudio();
  const config = useCamera(s => s.config);
  const mode = useCamera(s => s.mode);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const rotating = studio.rotating || mode === 'Cinematic';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);

  const capture = async () => {
    setCapturing(true);
    try {
      const source = root.current?.closest('.stage')?.querySelector('canvas');
      if (!source || !source.width || !useCamera.getState().ready) throw new Error('Viewer is still loading');
      await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = 1920; canvas.height = 1440;
      const ctx = canvas.getContext('2d')!;
      const backdrop = ctx.createRadialGradient(960, 660, 40, 960, 660, 1100);
      backdrop.addColorStop(0, lightingLooks[studio.look].backdrop); backdrop.addColorStop(1, lightingLooks[studio.look].edge);
      ctx.fillStyle = backdrop; ctx.fillRect(0, 0, 1920, 1440);
      ctx.fillStyle = '#243449'; ctx.font = '96px Anton'; ctx.fillText('NOVA / ALPHA', 90, 160);
      ctx.fillStyle = '#bf4325'; ctx.font = '28px Anton'; ctx.fillText('YOUR PERSPECTIVE. NO LIMITS.', 94, 218);
      const fit = Math.min(1740 / source.width, 1050 / source.height);
      ctx.drawImage(source, (1920 - source.width * fit) / 2, 210 + (1050 - source.height * fit) / 2, source.width * fit, source.height * fit);
      ctx.strokeStyle = '#24344930'; ctx.beginPath(); ctx.moveTo(90, 1270); ctx.lineTo(1830, 1270); ctx.stroke();
      ctx.fillStyle = '#243449'; ctx.font = '42px Anton'; ctx.fillText(`SONY ${bodyNames[config.body]}`, 90, 1340);
      ctx.font = '24px Anton'; ctx.fillText(`FE ${lenses.find(l => l.id === config.lens)?.name} / ${lightingLooks[studio.look].name.toUpperCase()}`, 90, 1385);
      ctx.textAlign = 'right'; ctx.fillStyle = '#bf4325'; ctx.fillText('DIRECTED BY YOU.', 1830, 1340);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Export failed')), 'image/png'));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `nova-${config.body.toLowerCase()}-${studio.look}.png`;
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      useCamera.getState().notify('Studio poster downloaded');
    } catch {
      useCamera.getState().notify('Could not capture the viewer. Let the model load and try again.');
    } finally { setCapturing(false); }
  };

  return <div className="photo-studio" ref={root}>
    <button ref={trigger} className={open ? 'active' : ''} aria-expanded={open} aria-controls="photo-studio-panel" onClick={() => setOpen(!open)}><SlidersHorizontal size={16} /><span>STUDIO</span></button>
    {open && <section id="photo-studio-panel" className="photo-panel" aria-label="Photo studio">
      <div className="photo-heading"><div><h2>Photo studio</h2></div><button aria-label="Close photo studio" onClick={() => { setOpen(false); trigger.current?.focus(); }}><X size={17} /></button></div>
      <div className="photo-looks" aria-label="Lighting looks">
        {(Object.entries(lightingLooks) as [LightingLook, typeof lightingLooks[LightingLook]][]).map(([id, look]) => <button key={id} aria-pressed={studio.look === id} className={`photo-look ${studio.look === id ? 'chosen' : ''}`} style={{ '--look-color': look.backdrop, '--rim-color': look.rim } as CSSProperties} onClick={() => studio.setLook(id)}><span className="look-orb" aria-hidden="true" /><span>{look.name}</span>{studio.look === id && <Check size={12} />}</button>)}
      </div>
      <label className="photo-slider"><span>LIGHT INTENSITY <output>{Math.round(studio.brightness * 100)}%</output></span><input aria-label="Light intensity" type="range" min="60" max="150" value={Math.round(studio.brightness * 100)} onChange={e => studio.setBrightness(Number(e.target.value) / 100)} /></label>
      <div className="photo-turntable"><span>TURNTABLE</span><button disabled={reduced} aria-pressed={rotating && !reduced} onClick={() => { if (mode === 'Cinematic') useCamera.getState().setMode('Product'); studio.setRotating(!rotating); }}>{rotating && !reduced ? <Pause size={14} /> : <Play size={14} />}{rotating && !reduced ? 'PAUSE' : 'PLAY'}</button></div>
      {reduced ? <p className="photo-mood">Motion is off to match your reduced-motion preference.</p> : <label className="photo-slider"><span>ROTATION SPEED <output>{studio.speed.toFixed(2)}×</output></span><input aria-label="Rotation speed" type="range" min="15" max="120" value={Math.round(studio.speed * 100)} onChange={e => studio.setSpeed(Number(e.target.value) / 100)} /></label>}
      <button className="photo-capture" disabled={capturing} onClick={capture}><Download size={17} />{capturing ? 'DEVELOPING…' : 'CAPTURE POSTER'}<span>PNG ↗</span></button>
      <div className="photo-footer"><span>1920 × 1440 / YOUR CURRENT ANGLE</span><button onClick={() => { studio.reset(); if (mode === 'Cinematic') useCamera.getState().setMode('Product'); }}>RESET</button></div>
    </section>}
  </div>;
}
