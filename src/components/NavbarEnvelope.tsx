import interior from '../assets/footer/envelopeInterior.png';
import pocket from '../assets/footer/envelopePocket.png';
import insideFlap from '../assets/footer/insideFlap.png';
import outsideFlap from '../assets/footer/outsideFlap.png';
import './NavbarEnvelope.css';

/** Shared paper layers for the desktop and mobile navigation triggers. */
export default function NavbarEnvelope({ isOpen }: { isOpen: boolean }) {
  return (
    <span className={`navbar-envelope ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
      <img className="navbar-envelope-interior" src={interior} alt="" draggable={false} />
      <span className="navbar-envelope-flap">
        <img className="navbar-envelope-flap-inside" src={insideFlap} alt="" draggable={false} />
        <img className="navbar-envelope-flap-outside" src={outsideFlap} alt="" draggable={false} />
      </span>
      <img className="navbar-envelope-pocket" src={pocket} alt="" draggable={false} />
    </span>
  );
}
