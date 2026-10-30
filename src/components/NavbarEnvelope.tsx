import insideFlap from '../assets/footer/insideFlap.png';
import waxSeal from '../assets/footer/antique-gold-wax-seal.webp';
import './NavbarEnvelope.css';

/** The same engraved paper as the landing and footer, in a compact live hinge. */
export default function NavbarEnvelope({ isOpen }: { isOpen: boolean }) {
  return (
    <span className={`navbar-envelope ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
      <span className="navbar-envelope-interior" />
      <span className="navbar-envelope-flap">
        <img className="navbar-envelope-flap-inside" src={insideFlap} alt="" draggable={false} />
        <span className="navbar-envelope-flap-outside">
          <svg viewBox="0 0 549 235" fill="none" focusable="false">
            <path d="M2 233L270 3Q274 0 278 3L547 233" stroke="#cb9671" strokeWidth="5" opacity=".65" />
          </svg>
        </span>
      </span>
      <span className="navbar-envelope-pocket" />
      <img className="navbar-envelope-seal" src={waxSeal} alt="" draggable={false} />
    </span>
  );
}
