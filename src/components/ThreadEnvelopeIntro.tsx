import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JuteRope as Twine } from './JuteRope';
import { createLandingCordRenderer, FULL_PULL, landingCordPose, landingPull } from './landingCord';
import { scrollToPosition } from '../lib/smoothScroll';
import './ThreadEnvelopeIntro.css';

gsap.registerPlugin(ScrollTrigger);

const tiedCord = landingCordPose();
const knotRelease = .86;
const liftStart = 2.38;
const liftDuration = .84;
const stagger = .15;
const departure = liftStart + liftDuration + stagger + .22;
const departureDuration = .86;
const expansion = departure + departureDuration;
const expansionDuration = 1.22;
const finish = expansion + stagger + expansionDuration;

const clamp = gsap.utils.clamp(0, 1);
const liftEase = gsap.parseEase('sine.inOut');
const dropEase = gsap.parseEase('sine.in');
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const bezier = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u ** 3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t ** 3 * d;
};

function preparePhoto(print: HTMLElement, slot: HTMLElement, scene: HTMLElement, pocket: HTMLElement, headroom: number, index: number) {
  const direction = index === 0 ? -1 : 1;
  const width = slot.offsetWidth, height = slot.offsetHeight;
  const heightRatio = height / width + .23;
  const smallWidth = Math.max(0, Math.min(scene.clientWidth * .40, (headroom + pocket.offsetTop - 24) / heightRatio));
  const halfHeight = smallWidth * heightRatio / 2;
  const center = scene.clientWidth / 2;
  gsap.set(print, { width, height });
  return {
    print, slot, width, height, direction,
    start: liftStart + index * stagger,
    expand: expansion + index * stagger,
    scale: smallWidth / width,
    startX: center + direction * scene.clientWidth * .025,
    startY: pocket.offsetTop + pocket.offsetHeight - halfHeight - 6,
    mouthY: pocket.offsetTop,
    holdX: center + direction * scene.clientWidth * .205,
    holdY: pocket.offsetTop - halfHeight - 12 - (direction < 0 ? 4 : 0),
    halfHeight,
  };
}

export default function ThreadEnvelopeIntro({ children, onCompleteChange }: {
  children: ReactNode;
  onCompleteChange: (complete: boolean) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tailHit = useRef<SVGPathElement>(null);
  const cue = useRef<SVGCircleElement>(null);
  const scroll = useRef<ScrollTrigger | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; start: number; scale: number } | null>(null);
  const pullDirection = useRef({ x: 1, y: 0 });
  const attemptedDrag = useRef(false);
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const track = trackRef.current, stage = root.current, scene = sceneRef.current;
    const pocket = scene?.querySelector<HTMLElement>('.thread-pocket');
    const button = buttonRef.current;
    if (!track || !stage || !scene || !pocket || !button) return;
    const slots = Array.from(track.nextElementSibling?.querySelectorAll<HTMLElement>('.about_card-wrap') ?? []);
    const prints = Array.from(scene.querySelectorAll<HTMLElement>('.thread-photo'));
    const select = gsap.utils.selector(stage);
    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, context => {
      if (!context.conditions?.moving) {
        onCompleteChange(true);
        return;
      }

      const cord = createLandingCordRenderer(stage);
      let fall: ReturnType<typeof cord.release> | undefined;
      let photos: ReturnType<typeof preparePhoto>[] = [];
      let viewportBottom = 0;
      let lastTime = -1;
      let complete: boolean | undefined;
      const measure = () => {
        const headroom = scene.getBoundingClientRect().top - stage.getBoundingClientRect().top;
        viewportBottom = (stage.clientHeight - headroom) * 600 / scene.clientWidth;
        photos = prints.map((print, index) => preparePhoto(print, slots[index], scene, pocket, headroom, index));
        lastTime = -1;
      };

      const shells = select('.thread-shell');
      const flapOutside = select('.thread-flap-outside'), flapInside = select('.thread-flap-inside');
      gsap.set(flapInside, { rotationX: -90, opacity: 0 });
      const envelope = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
        .to(select('.thread-hint, .thread-pull'), { autoAlpha: 0, duration: .24 }, knotRelease - .15)
        .to(flapOutside, { rotationX: -90, duration: .45, ease: 'sine.in' }, 1.66)
        .set(flapOutside, { opacity: 0 }, 2.11)
        .set(flapInside, { opacity: 1 }, 2.11)
        .set(select('.thread-flap-frame'), { zIndex: 1 }, 2.11)
        .to(flapInside, { rotationX: -180, duration: .6, ease: 'sine.out' }, 2.11);
      const shellX = gsap.quickSetter(shells, 'x', 'px');
      const shellY = gsap.quickSetter(shells, 'y', 'px');

      const render = (progress: number) => {
        const done = progress >= 1;
        if (done !== complete) {
          complete = done;
          track.toggleAttribute('data-complete', done);
          stage.inert = done;
          onCompleteChange(done);
        }
        if (done) return;

        const time = progress * finish;
        envelope.time(time);
        button.disabled = time >= knotRelease;
        const drop = dropEase(clamp((time - departure) / departureDuration));
        shellX(drop * 18);
        shellY(drop * (stage.clientHeight + scene.clientHeight));
        if (lastTime !== time) {
          if (time < knotRelease) {
            fall = undefined;
            const reach = FULL_PULL * time / knotRelease;
            const direction = pullDirection.current;
            const pose = reach === 0 ? tiedCord : landingCordPose(landingPull(direction.x * reach, direction.y * reach));
            cord.draw(pose);
            tailHit.current?.setAttribute('d', pose.tail);
            cue.current?.setAttribute('cx', String(pose.tip.x));
            cue.current?.setAttribute('cy', String(pose.tip.y));
            stage.dataset.phase = reach === 0 ? 'tied' : 'unraveling';
          } else if (time < knotRelease + 1.8) {
            const direction = pullDirection.current;
            fall ??= cord.release(landingCordPose(landingPull(direction.x * FULL_PULL, direction.y * FULL_PULL)), direction);
            stage.dataset.phase = fall(time - knotRelease, viewportBottom) ? 'clear' : 'falling';
          } else {
            stage.dataset.phase = 'clear';
          }
          lastTime = time;
        }

        // The actual About cards stay in document flow. Match their live
        // positions so the small copies hand off without a jump as the stage ends.
        const frame = time >= expansion ? scene.getBoundingClientRect() : null;
        const poses = photos.map(photo => {
          if (time <= photo.start) return { visibility: 'hidden' };
          const travel = liftEase(clamp((time - photo.start) / liftDuration));
          const grow = liftEase(clamp((time - photo.expand) / expansionDuration));
          let x = bezier(photo.startX, photo.startX, photo.holdX, photo.holdX, travel);
          let y = bezier(photo.startY, photo.mouthY, photo.holdY + photo.halfHeight * .35, photo.holdY, travel);
          let rotation = mix(-7, -2, travel) * photo.direction;
          if (frame && grow > 0) {
            const destination = photo.slot.getBoundingClientRect();
            x = mix(x, destination.left + destination.width / 2 - frame.left, grow);
            y = mix(y, destination.top + destination.height / 2 - frame.top, grow);
            rotation = mix(rotation, Number(gsap.getProperty(photo.slot, 'rotation')), grow);
          }
          return { x: x - photo.width / 2, y: y - photo.height / 2, rotation,
            scale: mix(photo.scale, 1, grow), opacity: clamp((time - photo.start) / .14), visibility: 'visible' };
        });
        poses.forEach((pose, index) => gsap.set(photos[index].print, pose));
      };
      measure();
      scroll.current = ScrollTrigger.create({
        trigger: track, start: 'top top', end: 'bottom bottom', refreshPriority: 1,
        onUpdate: self => render(self.progress),
        onRefresh: self => {
          measure();
          render(self.progress);
        },
      });
      render(scroll.current.progress);
      return () => {
        scroll.current = null;
        track.removeAttribute('data-complete');
        stage.inert = false;
        shellX(0);
        shellY(0);
        button.disabled = false;
      };
    }, stage);
    return () => media.revert();
  }, [onCompleteChange]);

  const open = () => {
    if (scroll.current) scrollToPosition(scroll.current.end, 3.4, liftEase);
  };

  const pointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || drag.current || !scroll.current || !sceneRef.current) return;
    event.preventDefault();
    attemptedDrag.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: window.scrollY,
      scale: sceneRef.current.getBoundingClientRect().width / 600 };
    setDragging(true);
  };

  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current, trigger = scroll.current;
    if (active?.id !== event.pointerId || !trigger) return;
    const x = (event.clientX - active.x) / active.scale, y = (event.clientY - active.y) / active.scale;
    const distance = Math.hypot(x, y);
    if (!attemptedDrag.current && distance < 5) return;
    attemptedDrag.current = true;
    if (distance > 0) pullDirection.current = { x: x / distance, y: y / distance };
    const knotEnd = trigger.start + (trigger.end - trigger.start) * knotRelease / finish;
    const next = active.start + (knotEnd - trigger.start) * distance / FULL_PULL;
    scrollToPosition(Math.min(next, knotEnd), 0);
    if (next < knotEnd) return;
    drag.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    open();
  };

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (active?.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (attemptedDrag.current) scrollToPosition(active.start, .36);
  };

  return <div ref={trackRef} className="thread-track">
    <div ref={root} className="thread-intro" data-phase="tied" data-dragging={dragging}>
      <div ref={sceneRef} className="thread-scene" aria-label="A burgundy envelope tied with twine, holding the ACM-W and ACM-VIT photo cards.">
        <div className="thread-rope-motion thread-rope-motion--rear" aria-hidden="true">
        <svg className="thread-twine thread-twine--rear" viewBox="0 0 600 500" fill="none" aria-hidden="true" focusable="false">
          <g strokeLinecap="round" strokeLinejoin="round">
            {tiedCord.sections.map((segment, index) => segment.side === 'rear' &&
              <g key={index} data-rope-segment={index}><Twine d={segment.d} points={segment.points}/></g>)}
          </g>
        </svg>
        </div>
        <div className="thread-shell thread-wall" aria-hidden="true"/>
        <div className="thread-photos" aria-hidden="true">{children}</div>
        <div className="thread-shell thread-pocket" aria-hidden="true"><svg viewBox="0 0 510 326" className="thread-fold-lines"><path d="M1 325L255 159L509 325" fill="none" stroke="#c18a60" strokeWidth=".7" opacity=".45"/></svg></div>
        <div className="thread-shell thread-flap-frame" aria-hidden="true">
          <div className="thread-flap thread-flap-inside"/>
          <div className="thread-flap thread-flap-outside"><svg viewBox="0 0 510 326" className="thread-fold-lines"><path d="M1 1L248 176Q255 181 262 176L509 1" fill="none" stroke="#c08b62" strokeWidth="1.2" opacity=".7"/></svg></div>
        </div>
        <div className="thread-rope-motion" aria-hidden="true">
        <svg className="thread-twine" viewBox="0 0 600 500" fill="none" aria-hidden="true" focusable="false">
          <g strokeLinecap="round" strokeLinejoin="round">
            {tiedCord.sections.map((segment, index) => segment.side === 'front' &&
              <g key={index} data-rope-segment={index}><Twine d={segment.d} points={segment.points}/></g>)}
          </g>
        </svg>
        </div>
        <button ref={buttonRef} className="thread-pull" type="button" aria-label="Open the envelope. Scroll down, drag the loose thread, or press Enter."
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
          onClick={event => { if (event.detail === 0 || !attemptedDrag.current) open(); }}>
          <svg viewBox="0 0 600 500" fill="none" aria-hidden="true" focusable="false">
            <g className="thread-pull__targets" stroke="transparent" strokeWidth="38" strokeLinecap="round">
              <path ref={tailHit} d={tiedCord.tail}/>
            </g>
            <circle ref={cue} className="thread-pull__ring" cx={tiedCord.tip.x} cy={tiedCord.tip.y} r="13"/>
          </svg>
        </button>
      </div>
      <div className="thread-hint" aria-hidden="true"><span className="thread-hint__arrow">↓</span><span>{dragging ? 'A little further…' : 'Scroll to open'}<small>or pull the loose thread</small></span></div>
    </div>
  </div>;
}
