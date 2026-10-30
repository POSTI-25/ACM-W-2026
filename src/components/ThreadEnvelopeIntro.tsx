import { useCallback, useId, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import gsap from 'gsap';
import { JuteRope as Twine } from './JuteRope';
import { landingRopeSegments, updateLandingRope } from './juteRopeGeometry';
import './ThreadEnvelopeIntro.css';

type Phase = 'tied' | 'opening' | 'open';
const leftBow = 'M300 230C270 190 214 196 223 221C233 247 277 244 300 230';
const rightBow = 'M300 230C320 187 374 165 369 196C363 222 327 230 300 230';
const tail = (x = 0, y = 0) => `M300 230C345 227 ${394 + x * .65} ${248 + y * .65} ${437 + x} ${283 + y}`;

/** The footer's envelope, untied by the visitor and opened on its own clock. */
export default function ThreadEnvelopeIntro() {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const recoil = useRef<gsap.core.Tween | null>(null);
  const phaseRef = useRef<Phase>('tied');
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pull = useRef({ x: 0, y: 0 });
  const [phase, setPhase] = useState<Phase>('tied');
  const [dragging, setDragging] = useState(false);
  const uid = useId().replace(/:/g, '');

  const changePhase = useCallback((next: Phase) => { phaseRef.current = next; setPhase(next); }, []);
  const drawTail = () => {
    const stage = root.current;
    if (!stage) return;
    updateLandingRope(stage, pull.current.x, pull.current.y);
    stage.querySelector('[data-pull-hit]')?.setAttribute('d', tail(pull.current.x, pull.current.y));
    stage.querySelector('.thread-pull__cue')?.setAttribute('transform', `translate(${pull.current.x} ${pull.current.y})`);
  };

  useLayoutEffect(() => {
    const stage = root.current;
    if (!stage) return;
    const scene = stage.querySelector<HTMLElement>('.thread-scene')!;
    const select = gsap.utils.selector(stage);
    let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const reset = () => {
        gsap.set(select('.thread-flap-outside'), { rotationX: 0, opacity: 1 });
        gsap.set(select('.thread-flap-inside'), { rotationX: -90, opacity: 0 });
        gsap.set(select('.thread-flap-frame'), { zIndex: 4 });
        gsap.set(select('.thread-letter'), { y: 0, yPercent: 0, scale: 1, rotation: 0, autoAlpha: 1 });
      };
      reset();
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' },
        onComplete: () => { changePhase('open'); },
      });
      timeline.current = tl;
      const ropeShape = { loosen: 0 };
      tl.to(select('.thread-hint, .thread-pull'), { autoAlpha: 0, duration: .2 }, 0)
        .to(ropeShape, { loosen: 1, duration: 1.05, ease: 'sine.inOut', onUpdate: () => {
          updateLandingRope(stage, pull.current.x, pull.current.y, ropeShape.loosen);
        } }, 0)
        .to(select('.thread-rope-motion'), { y: () => stage.clientHeight + scene.clientWidth, x: 38, rotation: 18, transformOrigin: '50% 45%', duration: 1.45, ease: 'power2.in' }, .85)
        .to(select('.thread-flap-outside'), { rotationX: -90, duration: .5, ease: 'sine.in' }, 1.4)
        .set(select('.thread-flap-outside'), { opacity: 0 }, 1.9)
        .set(select('.thread-flap-inside'), { opacity: 1 }, 1.9)
        .set(select('.thread-flap-frame'), { zIndex: 1 }, 1.9)
        .to(select('.thread-flap-inside'), { rotationX: -180, duration: .65, ease: 'sine.out' }, 1.9)
        .to(select('.thread-letter'), { yPercent: -34, rotation: -2, duration: 1.25 }, 2.3)
        .to(select('.thread-shell'), { y: () => `+=${stage.clientHeight + scene.clientHeight * 2}`, x: 28, duration: 1.3, ease: 'power2.in' }, 3.4)
        .to(select('.thread-letter'), { yPercent: 0, scale: 1.25, rotation: 0, duration: 1.15, ease: 'power3.out' }, 3.8);
    }, stage);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => { reduced = media.matches; if (reduced && phaseRef.current === 'opening') timeline.current?.progress(1); };
    media.addEventListener('change', onMotionChange);
    return () => {
      media.removeEventListener('change', onMotionChange);
      recoil.current?.kill(); ctx.revert(); timeline.current = null;
    };
  }, [changePhase]);

  const open = () => {
    if (phaseRef.current !== 'tied' || !timeline.current) return;
    recoil.current?.kill(); drag.current = null; setDragging(false); changePhase('opening');
    timeline.current.restart();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) timeline.current.progress(1);
  };
  const pointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (phaseRef.current !== 'tied' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    recoil.current?.kill(); event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; setDragging(true);
  };
  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.id !== event.pointerId || phaseRef.current !== 'tied') return;
    const scale = root.current!.querySelector<HTMLElement>('.thread-scene')!.clientWidth / 600;
    const x = (event.clientX - drag.current.x) / scale, y = (event.clientY - drag.current.y) / scale;
    pull.current.x = Math.max(-90, Math.min(130, x)); pull.current.y = Math.max(-90, Math.min(110, y)); drawTail();
    if (Math.hypot(event.clientX - drag.current.x, event.clientY - drag.current.y) >= 28) {
      open();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const release = () => {
    if (!drag.current) return;
    drag.current = null; setDragging(false);
    recoil.current = gsap.to(pull.current, { x: 0, y: 0, duration: .35, ease: 'power3.out', onUpdate: drawTail });
  };

  return <div ref={root} className="thread-intro" data-phase={phase} data-dragging={dragging}>
    <div className="thread-scene" aria-label="A burgundy envelope tied with twine, containing a blank ivory letter.">
      <div className="thread-rope-motion thread-rope-motion--rear" aria-hidden="true">
      <svg className="thread-twine thread-twine--rear" viewBox="0 0 600 500" fill="none" aria-hidden="true" focusable="false">
        <g strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid}-thread-shadow)`}>
          {landingRopeSegments().map((segment, index) => segment.side === 'rear' &&
            <g key={index} data-rope-segment={index}><Twine d={segment.d}/></g>)}
        </g>
      </svg>
      </div>
      <div className="thread-shell thread-wall" aria-hidden="true"/>
      <div className="thread-letter" role="img" aria-label="Blank textured ivory letter"/>
      <div className="thread-shell thread-pocket" aria-hidden="true"><svg viewBox="0 0 510 326" className="thread-fold-lines"><path d="M1 325L255 159L509 325" fill="none" stroke="#c18a60" strokeWidth=".7" opacity=".45"/></svg></div>
      <div className="thread-shell thread-flap-frame" aria-hidden="true">
        <div className="thread-flap thread-flap-inside"/>
        <div className="thread-flap thread-flap-outside"><svg viewBox="0 0 510 326" className="thread-fold-lines"><path d="M1 1L248 176Q255 181 262 176L509 1" fill="none" stroke="#c08b62" strokeWidth="1.2" opacity=".7"/></svg></div>
      </div>
      <div className="thread-rope-motion" aria-hidden="true">
      <svg className="thread-twine" viewBox="0 0 600 500" fill="none" aria-hidden="true" focusable="false">
        <defs><filter id={`${uid}-thread-shadow`} x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".25" numOctaves="2" seed="8" result="fibres"/><feDisplacementMap in="SourceGraphic" in2="fibres" scale=".75" xChannelSelector="R" yChannelSelector="G"/><feDropShadow dx=".7" dy="1.8" stdDeviation=".9" floodColor="#2a100b" floodOpacity=".45"/></filter></defs>
        <g strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid}-thread-shadow)`}>
          {landingRopeSegments().map((segment, index) => segment.side === 'front' &&
            <g key={index} data-rope-segment={index}><Twine d={segment.d}/></g>)}
        </g>
      </svg>
      </div>
      <button className="thread-pull" type="button" aria-label="Pull the loose thread to open the envelope. Drag it, or press Enter." disabled={phase !== 'tied'}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
        onClick={open}>
        <svg viewBox="0 0 600 500" fill="none" aria-hidden="true" focusable="false">
          <g className="thread-pull__targets" stroke="transparent" strokeWidth="38" strokeLinecap="round">
            <path d={`${leftBow} ${rightBow} M300 71L300 399 M300 230C285 252 272 294 250 326C233 353 207 375 191 386`}/>
            <path data-pull-hit d={tail()}/>
          </g>
          <g className="thread-pull__cue"><circle className="thread-pull__ring" cx="437" cy="283" r="13"/></g>
        </svg>
      </button>
    </div>
    <div className="thread-hint" aria-hidden="true"><span className="thread-hint__arrow">↗</span><span>{dragging ? 'A little further…' : 'Pull the loose thread'}<small>drag to open</small></span></div>
    <p className="thread-status" role="status">{phase === 'open' ? 'The envelope is open. A blank letter is ready.' : phase === 'opening' ? 'The thread is coming loose and the envelope is opening.' : 'Pull the thread, or focus its end and press Enter to open the envelope.'}</p>
  </div>;
}
