import { useRef, useEffect, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cooldownRemainingMs } from '../lib/rateLimit';
import { createFooterSealingMotion } from './footerSealingMotion';
import { createFooterBotanicalMotion } from './footerBotanicalMotion';
import { footerEnvelopeGeometry } from './footerEnvelopeGeometry';
import FooterSealStamp, { type FooterStampHandle } from './FooterSealStamp';
import './EnvelopeFooter.css';
import './EnvelopeFooterVintage.css';

// Assets from src/assets/footer/
import envelopeBacksideImg from '../assets/footer/envelopeBackside.png';
import envelopeInteriorImg from '../assets/footer/envelopeInterior.png';
import brownCardImg from '../assets/footer/brownCard.png';
import envelopePocketImg from '../assets/footer/envelopePocket.png';

// Two-part flap assets (both are upright triangles pointing UP)
import insideFlapImg from '../assets/footer/insideFlap.png';
import outsideFlapImg from '../assets/footer/outsideFlap.png';
import waxSealImg from '../assets/footer/antique-gold-wax-seal.webp';
import driedWildflowerImg from '../assets/footer/dried-wildflower-sprig.webp';

// Social media icons & heart
import heartImg from '../assets/footer/heart.png';
import githubIcon from '../assets/footer/github.png';
import facebookIcon from '../assets/footer/facebook.png';
import instaIcon from '../assets/footer/insta.png';
import twitterIcon from '../assets/footer/twitter.png';
import linkedInIcon from '../assets/footer/linkedIn.png';
import ytIcon from '../assets/footer/yt.png';

// Feather cursor — recolored at runtime for the envelope hover
import featherCursorImg from '../assets/feather-cursor.png';


gsap.registerPlugin(ScrollTrigger);

function PostalMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.1">
        <circle cx="90" cy="90" r="66" />
        <circle cx="90" cy="90" r="59" strokeDasharray="2 3" />
        <path d="M145 63c25-18 38 18 64 0s39 18 65 0M151 78c25-18 38 18 64 0s39 18 65 0M153 93c25-18 38 18 64 0s39 18 65 0M150 108c25-18 38 18 64 0s39 18 65 0" />
        <path d="M57 97h66M67 65h46" strokeWidth=".7" />
      </g>
      <g fill="currentColor" textAnchor="middle" fontFamily="Georgia, serif">
        <text x="90" y="88" fontSize="20" letterSpacing="2">ACM-W</text>
        <text x="90" y="116" fontSize="9" letterSpacing="2">VELLORE</text>
        <text x="90" y="52" fontSize="7" letterSpacing="1.8">SPECIAL DELIVERY</text>
        <text x="90" y="138" fontSize="7" letterSpacing="1.5">WITH CURIOSITY</text>
      </g>
    </svg>
  );
}

export default function EnvelopeFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'throttled';
  const [status, setStatus] = useState<FormStatus>('idle');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
  });

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(trimmed) ? '' : 'Enter a valid email address, including a domain like .com.';
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Phone number is required.';
    const phoneRegex = /^(?:\+?\d{10}|\+?\d{11,15})$/;
    return phoneRegex.test(digits) ? '' : 'Enter a valid phone number with 10 digits or international format.';
  };

  // Seconds left on the throttle, surfaced on the submit button.
  const [retryIn, setRetryIn] = useState(0);

  // Tick the throttle down and release the button when it expires.
  useEffect(() => {
    if (status !== 'throttled') return;

    const tick = () => {
      const remaining = cooldownRemainingMs();
      if (remaining <= 0) {
        setRetryIn(0);
        setStatus('idle');
        return;
      }
      setRetryIn(Math.ceil(remaining / 1000));
    };

    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [status]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    // Throttle first — a blocked submit shouldn't spend a reCAPTCHA check.
    const wait = cooldownRemainingMs();
    if (wait > 0) {
      setRetryIn(Math.ceil(wait / 1000));
      setStatus('throttled');
      return;
    }

    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const nextErrors = {
      email: emailError,
      phone: phoneError,
    };

    setFieldErrors(nextErrors);

    if (emailError || phoneError) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setStatus('success');
    } catch (err: unknown) {
      console.error('Form submission error:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
      }
      setStatus('error');
    }

  };

  const handleChange = (field: string, value: string) => {
    const nextValue = field === 'phone' ? value.replace(/\D/g, '') : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));

    if (field === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(nextValue) }));
    }

    if (field === 'phone') {
      setFieldErrors((prev) => ({ ...prev, phone: validatePhone(nextValue) }));
    }

    if (status === 'error') {
      setStatus('idle');
    }
  };
  const envelopeWrapperRef = useRef<HTMLDivElement>(null);
  const envelopeShellRef = useRef<HTMLDivElement>(null);

  // Front-face layer refs
  const envelopeInteriorRef = useRef<HTMLDivElement>(null);
  const brownCardRef = useRef<HTMLDivElement>(null);
  const envelopePocketRef = useRef<HTMLDivElement>(null);

  // Two-part flap refs
  const insideFlapRef = useRef<HTMLDivElement>(null);
  const outsideFlapRef = useRef<HTMLDivElement>(null);
  const waxSealRef = useRef<HTMLImageElement>(null);
  const waxContainerRef = useRef<HTMLDivElement>(null);
  const sealStampRef = useRef<HTMLDivElement>(null);
  const stampAnchorRef = useRef<HTMLDivElement>(null);
  const stampModelRef = useRef<FooterStampHandle>(null);

  // ---- Light cursor on envelope hover ----
  // The site-wide cursor is a dark feather PNG. When hovering over the
  // envelope asset itself (not the section background), we swap to a
  // #FFF9E9 recolored version. Built at runtime from the same source
  // PNG using canvas — zero extra assets needed.
  useEffect(() => {
    let style: HTMLStyleElement | null = null;
    let cancelled = false;

    const img = new Image();
    img.src = featherCursorImg;
    img.onload = () => {
      // Guard: if the component unmounted (or HMR replaced it) while
      // the image was loading, bail out so we don't leak a stale
      // <style> into document.head.
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Draw the original dark feather
      ctx.drawImage(img, 0, 0);

      // Recolor: 'source-in' replaces RGB of existing pixels
      // while preserving their original alpha channel.
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = '#FFF9E9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png');

      // Inject a scoped style — targets only the envelope wrapper
      // and its children. The cursor reverts automatically when
      // the mouse leaves because parent elements keep the dark cursor.
      style = document.createElement('style');
      style.textContent = `
        .envelope-wrapper {
          cursor: url("${dataUrl}") 4 4, auto;
        }
      `;
      document.head.appendChild(style);
    };

    return () => {
      cancelled = true;
      if (style?.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // The timeline's pixel values are scaled by the wrapper's width, so the
  // whole GSAP context is torn down and rebuilt whenever that width changes
  // (e.g. a desktop -> mobile resize or an orientation change). Width is
  // tracked in state so the effect below simply re-runs.
  const [wrapperWidth, setWrapperWidth] = useState(0);
  useEffect(() => {
    const envelopeWrapper = envelopeWrapperRef.current;
    if (!envelopeWrapper) return;
    const measure = () =>
      setWrapperWidth(envelopeWrapper.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(envelopeWrapper);
    return () => ro.disconnect();
  }, []);

  // Build the scroll-driven timeline on mount. The envelope's in-flow image
  // (.envelope-interior) and the contact card reserve their aspect-ratio in
  // CSS, so the wrapper has its true height before any image has loaded and
  // ScrollTrigger measures the right thing straight away — no deferred init,
  // no mid-scroll ScrollTrigger.refresh() reflowing the page.
  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    const envelopeWrapper = envelopeWrapperRef.current;
    const envelopeInterior = envelopeInteriorRef.current;
    const brownCard = brownCardRef.current;
    const envelopePocket = envelopePocketRef.current;
    const insideFlap = insideFlapRef.current;
    const outsideFlap = outsideFlapRef.current;
    const waxSeal = waxSealRef.current;
    const waxContainer = waxContainerRef.current;
    const sealStamp = sealStampRef.current;
    const stampAnchor = stampAnchorRef.current;
    const waxPool = waxContainer?.querySelector<HTMLDivElement>('#wax-pool');

    if (
      !section || !pinContainer || !envelopeWrapper ||
      !envelopeInterior || !brownCard || !envelopePocket ||
      !insideFlap || !outsideFlap || !waxSeal || !waxContainer || !sealStamp || !stampAnchor || !waxPool || !envelopeShellRef.current
    ) return;

    const envelopeShell = envelopeShellRef.current;
    // Keep the WebGL canvas above the CSS paper planes, centred on their
    // projected wax point. Its camera follows the same paper angle.
    const syncStampAnchor = () => {
      const surface = waxContainer.getBoundingClientRect();
      const panel = pinContainer.getBoundingClientRect();
      stampAnchor.style.left = `${surface.left + surface.width / 2 - panel.left}px`;
      stampAnchor.style.top = `${surface.top + surface.height / 2 - panel.top}px`;
      stampAnchor.style.width = `${surface.width * 5.5}px`;
    };
    let disposed = false;
    let syncFlower: (() => void) | undefined;

    const ctx = gsap.context(() => {
      // ---- Responsive value scaling ----
      // The animation was designed for a 600px-wide envelope. On mobile
      // the wrapper is ~300px, so all pixel-based GSAP values must scale
      // proportionally. The ratio is rebuilt whenever the wrapper resizes.
      const width = Number.parseFloat(getComputedStyle(envelopeWrapper).width) || wrapperWidth || 600;
      const r = width / 600; // 1.0 on desktop, ~0.5 on mobile
      const { flapScale, flapY } = footerEnvelopeGeometry(width, width * (271 / 531));
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---- Initial state setup ----

      // Brown card: starts enlarged (scale 1.4) so the user can
      // comfortably fill the form. Shrinks to 1 as the first scroll step.
      gsap.set(brownCard, {
        y: 0,
        scale: 1.4,
        rotateX: 0,
        rotateZ: 0,
        x: 10 * r,
        z: 1.05,
      });

      // ---- Envelope shell: hidden off-screen below ----
      // The shell wraps interior, pocket, and flap. All layers are
      // pre-positioned at their final resting transforms inside the
      // shell. The shell itself handles visibility — when it slides
      // up, everything appears together as one cohesive unit.
      gsap.set(envelopeShell, { y: '100%', visibility: 'hidden' });
      gsap.set(insideFlap.parentElement, { z: 0 });

      // Envelope layers: pre-positioned at resting layout.
      // No individual opacity:0 needed — the shell hides them.
      gsap.set(envelopeInterior, {
        scale: 0.80,
        y: 40 * r,
        z: 1,
      });
      gsap.set(envelopePocket, {
        scale: 1.6,
        z: 1.2,
      });

      // Inside flap: pre-positioned at resting state.
      // Hinge is at bottom center (CSS: transform-origin: bottom center).
      gsap.set(insideFlap, { transformOrigin: '50% 100%' });
      gsap.set(insideFlap, {
        rotateX: 0,
        y: flapY,
        scale: flapScale,
        z: -.3,
      });

      // Outside flap: set pivot at base, then match insideFlap's
      // position so the handoff is seamless. Must have IDENTICAL
      // y, scale, z as insideFlap at the moment of the swap.
      // Keeps its own opacity: 0 — only revealed during flap relay.
      gsap.set(outsideFlap, { transformOrigin: '50% 100%' });
      gsap.set(outsideFlap, {
        opacity: 0,
        rotateX: -90,
        y: flapY,
        scale: flapScale,
        z: 1.3,
      });

      // A local surface follows the original flap anchor. Counter-rotation
      // keeps the liquid, tooling and embossed W upright after the fold.
      gsap.set(waxContainer, {
        xPercent: -50,
        yPercent: -50,
        rotateX: 180,
      });

      // Wrapper: no rotation yet
      gsap.set(envelopeWrapper, { rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 0, scale: 1 });
      const botanical = section.querySelector('.footer-botanical');
      const endnote = section.querySelector('.footer-endnote');
      gsap.set([botanical, endnote], { autoAlpha: 0 });

      // Keep the existing geometry and 3D depth ordering. Only the rhythm
      // changes: gently overlapping preparation, a continuous fold, then a turn.
      const tl = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      tl.addLabel('settle', 0)
        .addLabel('lift', 1.8)
        .addLabel('tilt', 3)
        .addLabel('arrive', 4.2)
        .addLabel('tuck', 6.4)
        .addLabel('fold', 9.5)
        .addLabel('hinge', 11)
        .addLabel('closed', 12.5);

      tl.to(brownCard, {
        scale: 1,
        duration: 1.8,
        ease: 'sine.out',
      }, 'settle');

      tl.to(brownCard, { scale: 1.1, duration: 2 }, 'lift');
      tl.to(brownCard, {
        rotateZ: 5,
        z: 1.1,
        x: -1 * r,
        duration: 2,
      }, 'tilt');

      // Move the complete shell together. Opacity on this preserve-3d
      // parent would flatten the card/pocket sandwich, so use visibility.
      tl.set(envelopeShell, { visibility: 'visible' }, 'arrive');
      tl.to(envelopeShell, { y: 0, duration: 2.3 }, 'arrive');

      tl.to(brownCard, {
        rotation: 0,
        rotateX: 0,
        scale: 1,
        x: -5 * r,
        y: '25%',
        z: 1.1,
        duration: 2.8,
      }, 'tuck');

      const flapContainer = insideFlap.parentElement!;
      // Stay on the pocket's plane so perspective cannot pull the corners apart.
      tl.set(flapContainer, { zIndex: 5, z: 0 }, 'fold');
      tl.set(insideFlap, { z: 1.3 }, 'fold');

      // These are the two halves of ONE sine.inOut fold. sine.in reaches
      // the edge-on hinge at full speed; sine.out continues at that same
      // speed, instead of braking and restarting at 90 degrees.
      tl.to(insideFlap, {
        rotateX: -90,
        scale: flapScale,
        duration: 1.5,
        ease: 'sine.in',
      }, 'fold');

      // Swap faces only at the edge-on frame, preserving their hinge,
      // coordinates, scale and depth. GSAP sets also reverse on scroll-up.
      tl.set(outsideFlap, { opacity: 1 }, 'hinge');
      tl.set(insideFlap, { opacity: 0 }, 'hinge');
      tl.to(outsideFlap, {
        rotateX: -180,
        scale: flapScale,
        y: flapY,
        z: 1.3,
        duration: 1.5,
        ease: 'sine.out',
      }, 'hinge');

      // Sealing and placing the envelope follow scroll; the flower follows afterwards.
      tl.to({}, { duration: .6 });
      const finish = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } });
      // Give the stamp more scroll distance while preserving its choreography.
      finish.add(createFooterSealingMotion({
        stamp: sealStamp,
        pool: waxPool,
        drops: Array.from(waxContainer.querySelectorAll<HTMLElement>('.wax-drop')),
        seal: waxSeal,
        envelope: envelopeWrapper,
        ratio: r,
        viewportWidth: window.innerWidth,
        envelopeWidth: width,
        reducedMotion,
        stampModel: stampModelRef.current,
      }).timeScale(.75).paused(false), 0);
      finish.addLabel('flatten');
      finish.addLabel('turn', 'flatten+=.35');

      // Ease the closely registered paper layers into their resting depth stack.
      finish.to(envelopeInterior, { z: -0.3, duration: .35 }, 'flatten');
      finish.to(brownCard, { z: 0, duration: .35 }, 'flatten');
      finish.to(envelopePocket, { z: 0.3, duration: .35 }, 'flatten');
      finish.to(flapContainer, { z: 0.5, duration: .35 }, 'flatten');
      finish.to(outsideFlap, { z: 0.6, duration: .35 }, 'flatten');

      // Rest the complete sealed assembly diagonally; local hinges stay untouched.
      finish.to(envelopeWrapper, {
        rotateZ: -12, x: 16 * r, y: -60 * r,
        scale: window.innerWidth < 600 ? .86 : .94,
        duration: reducedMotion ? 0 : 3.4,
      }, 'turn');
      finish.addLabel('envelope-rest');
      const botanicalFlight = createFooterBotanicalMotion(botanical, r, pinContainer.clientHeight, reducedMotion);
      tl.add(finish.paused(false), '+=.35');
      const placedAt = finish.startTime() + finish.labels['envelope-rest'];
      // Preserve the slower scroll pacing, with the envelope resting during the fall.
      const flowerDelay = reducedMotion ? 0 : .45;
      const noteDelay = reducedMotion ? 0 : .35;
      const noteDuration = reducedMotion ? 0 : 1.8;
      tl.to({}, { duration: flowerDelay + botanicalFlight.duration() + noteDelay + noteDuration + 3.5 });

      const flowerFinish = gsap.timeline({ paused: true });
      flowerFinish.add(botanicalFlight.paused(false), flowerDelay);
      flowerFinish.to(endnote, { autoAlpha: 1, duration: noteDuration }, `+=${noteDelay}`);
      let flowerStarted = false;
      syncFlower = () => {
        if (disposed) return;
        syncStampAnchor();
        if (tl.time() >= placedAt && !flowerStarted) {
          flowerStarted = true;
          flowerFinish.restart();
        } else if (tl.time() < placedAt && flowerStarted) {
          // Opening/rewinding the envelope prepares the flower for the next arrival.
          flowerStarted = false;
          flowerFinish.pause(0);
          gsap.set([botanical, endnote], { autoAlpha: 0 });
        }
      };
      tl.eventCallback('onUpdate', syncFlower);
    }, section);

    // Rebuilding mid-page: make ScrollTrigger re-measure so the fresh
    // timeline is scrubbed to the current scroll position immediately.
    ScrollTrigger.refresh();
    syncFlower?.();
    ScrollTrigger.addEventListener('refresh', syncStampAnchor);

    return () => {
      disposed = true;
      ScrollTrigger.removeEventListener('refresh', syncStampAnchor);
      ctx.revert();
    };
  }, [wrapperWidth]);

  return (
    <section ref={sectionRef} className="scroll-section" id="contact">
      <div ref={pinContainerRef} className="scroll-section__pin-container">
        <div className="footer-stationery" aria-hidden="true">
          <PostalMark className="footer-stationery__postmark" />
          <svg className="footer-stationery__trail" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" focusable="false">
            <path d="M-80 700C130 870 340 780 290 650S60 575 90 725C120 900 480 860 660 760S1060 730 1240 550s20-380 300-430" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
            <path d="m125 598 144 35-100 100-9-69-35-66Zm35 66 109-31-90 47-10 53" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="footer-stationery__address">ACM-W CORRESPONDENCE<br />VIT · VELLORE, INDIA</span>
        </div>
        <div className="footer-closing-caption">
          <p>WITH CURIOSITY, ALWAYS</p>
          <span>Until our next chapter.</span>
        </div>
        <div className="scene">
          <img className="footer-botanical" src={driedWildflowerImg} width={1024} height={1536}
            alt="" aria-hidden="true" draggable={false} loading="lazy" decoding="async" />
          <div ref={envelopeWrapperRef} className="envelope-wrapper">

            {/* ========== FRONT FACE ========== */}
            <div className="front-face">

              {/* Z-3: Brown contact card — lives directly in front-face,
                  NOT inside the envelope-shell, so its animations
                  (shrink, zoom, tilt) are completely independent. */}
              <div ref={brownCardRef} className="brown-card">
                <img src={brownCardImg} alt="Contact card" className="brown-card__bg" draggable={false} />
                <form className="brown-card__form" onSubmit={handleSubmit}>
                  <h2 className="brown-card__heading">CONTACT US</h2>

                  <div className="brown-card__field">
                    <div className="brown-card__field-row">
                      <label className="brown-card__label" htmlFor="contact-name">Name:</label>
                      <input
                        id="contact-name"
                        className="brown-card__input"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="brown-card__field">
                    <div className="brown-card__field-row">
                      <label className="brown-card__label" htmlFor="contact-email">E-mail:</label>
                      <input
                        id="contact-email"
                        className="brown-card__input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="brown-card__field-error">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="brown-card__field">
                    <div className="brown-card__field-row">
                      <label className="brown-card__label" htmlFor="contact-phone">Phone:</label>
                      <input
                        id="contact-phone"
                        className="brown-card__input"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9+]*"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="brown-card__field-error">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="brown-card__field">
                    <label className="brown-card__label" htmlFor="contact-message">Message:</label>
                    <textarea
                      id="contact-message"
                      className="brown-card__input brown-card__textarea"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`brown-card__submit brown-card__submit--${status}`}
                    disabled={status === 'loading' || status === 'throttled'}
                  >
                    {status === 'loading' && 'Sending…'}
                    {status === 'success' && 'thank you'}
                    {status === 'error' && 'Try again'}
                    {status === 'throttled' && `Wait ${retryIn}s`}
                    {status === 'idle' && 'Submit'}
                  </button>
                </form>
              </div>

              {/* Envelope shell — wraps all visual envelope layers.
                  Animated as a single unit via translateY for the
                  synchronized slide-in. Brown card is NOT inside. */}
              <div ref={envelopeShellRef} className="envelope-shell">

                {/* Z-2: Tan interior back wall */}
                <div ref={envelopeInteriorRef} className="envelope-interior">
                  <img src={envelopeInteriorImg} alt="Envelope interior" draggable={false} />
                </div>

                {/* Z-4: Front red pocket */}
                <div ref={envelopePocketRef} className="envelope-pocket">
                  <img src={envelopePocketImg} alt="Envelope pocket" draggable={false} />
                </div>

                {/* Z-5: Two-part flap — both sit in same 3D space,
                    stacked on top of each other. insideFlap shows first,
                    outsideFlap takes over at the 90° handoff. */}
                <div className="flap-container">
                  <div ref={insideFlapRef} className="inside-flap">
                    <img src={insideFlapImg} alt="Envelope flap inside" draggable={false} />
                  </div>
                  <div ref={outsideFlapRef} className="outside-flap">
                    <img src={outsideFlapImg} alt="Envelope flap outside" draggable={false} />
                    <div ref={waxContainerRef} id="wax-container" aria-hidden="true">
                      <div id="wax-pool" />
                      {[0, 1, 2, 3].map(drop => <span key={drop} className="wax-drop" />)}
                      <img ref={waxSealRef} className="footer-wax-seal" src={waxSealImg} alt="" draggable={false} />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* ========== BACK FACE ========== */}
            <div className="envelope-backside">
              <img
                src={envelopeBacksideImg}
                alt="Envelope backside"
                className="back-face__img"
                draggable={false}
              />


            </div>

          </div>
        </div>
              <div ref={stampAnchorRef} className="footer-stamp-anchor" aria-hidden="true">
                <div ref={sealStampRef} id="seal-stamp"><FooterSealStamp ref={stampModelRef}/></div>
              </div>
              <div className="back-face__content footer-endnote">
                <div className="back-face__text-block">
                  <div className="back-face__text-row">
                    <span className="back-face__text">crafted with love by ACM-VIT</span>
                    <img
                      src={heartImg}
                      alt="heart"
                      className="back-face__heart"
                      draggable={false}
                    />
                  </div>
                  <span className="back-face__signature">Yours, ACM-W</span>
                </div>

                <div className="back-face__social-row">
                  <a href="https://github.com/ACM-VIT" target="_blank" rel="noopener noreferrer">
                    <img src={githubIcon} alt="GitHub" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="https://www.facebook.com/acmvitvellore/" target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="https://www.instagram.com/acmwvit/" target="_blank" rel="noopener noreferrer">
                    <img src={instaIcon} alt="Instagram" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={twitterIcon} alt="Twitter / X" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="https://www.linkedin.com/company/acmw-vit/?originalSubdomain=in" target="_blank" rel="noopener noreferrer">
                    <img src={linkedInIcon} alt="LinkedIn" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={ytIcon} alt="YouTube" className="back-face__social-icon" draggable={false} />
                  </a>
                </div>
              </div>
      </div>
    </section>
  );
}
