import { Camera, Gamepad2, MousePointer2, SlidersHorizontal, X } from "lucide-react";
import { Modal } from "./Modal";

export default function Welcome({ onClose }: { onClose: () => void }) {
  return (
    <Modal label="Welcome to NOVA" onClose={onClose} className="welcome-modal">
      <button className="welcome-close" aria-label="Close introduction" onClick={onClose}><X size={20} /></button>
      <span className="eyebrow">WELCOME TO NOVA</span>
      <h2>Your camera.<br />Your perspective.</h2>
      <p className="welcome-lead">Build a camera, explore every angle, and make it yours.</p>
      <ul className="welcome-steps">
        <li><MousePointer2 size={21} aria-hidden="true" /><div><strong>Take a look around</strong><p>Drag to rotate. Scroll or pinch to zoom. Use the view buttons below the camera, or Reset camera to return.</p></div></li>
        <li><SlidersHorizontal size={21} aria-hidden="true" /><div><strong>Make it yours</strong><p>Choose a body, colour, lens, and accessories in Customize. On mobile, scroll below the viewer.</p></div></li>
        <li><Camera size={21} aria-hidden="true" /><div><strong>Set the scene</strong><p>Open Studio to change the light, spin your camera, and download a poster. More lets you explore the parts in an exploded view.</p></div></li>
        <li><Gamepad2 size={21} aria-hidden="true" /><div><strong>Try your eye</strong><p>Play Game opens Shot Lab: three quick photography challenges. Share saves your setup in a link.</p></div></li>
      </ul>
      <button className="primary-button welcome-start" autoFocus onClick={onClose}>LET’S EXPLORE <span aria-hidden="true">↗</span></button>
      <p className="welcome-footnote">You can reopen this guide with the help button at the top.</p>
    </Modal>
  );
}
