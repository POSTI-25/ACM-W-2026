import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import quill from '../assets/decor/black-feather.svg';
import './EventsQuill.css';

gsap.registerPlugin(ScrollTrigger);
type Point = { x: number; y: number };
const SAMPLE_COUNT = 240;

/** Cache arc-length samples on layout changes, never during an animation frame. */
function samplePath(path: SVGPathElement): Point[] {
  const length = path.getTotalLength();
  return Array.from({ length: SAMPLE_COUNT + 1 }, (_, index) => {
    const point = path.getPointAtLength(length * index / SAMPLE_COUNT);
    return { x: point.x, y: point.y };
  });
}
function pointAt(points: Point[], progress: number): Point {
  const position = Math.max(0, Math.min(1, progress)) * SAMPLE_COUNT;
  const index = Math.min(SAMPLE_COUNT - 1, Math.floor(position));
  const blend = position - index;
  return { x: points[index].x + (points[index + 1].x - points[index].x) * blend,
    y: points[index].y + (points[index + 1].y - points[index].y) * blend };
}

/** A scroll-owned nib traces a separate left flourish, then softly suspends. */
export default function EventsQuill() {
  const root = useRef<SVGSVGElement>(null);
  const approachRef = useRef<SVGPathElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const penRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const svg = root.current;
    const approach = approachRef.current;
    const stroke = strokeRef.current;
    const pen = penRef.current;
    const journey = svg?.closest('.chapter-journey');
    const events = journey?.querySelector<HTMLElement>('#events');
    const intro = events?.querySelector<HTMLElement>('.events-intro');
    const heading = intro?.querySelector<HTMLElement>('h1');
    if (!svg || !approach || !stroke || !pen || !journey || !events || !intro || !heading) return;

    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)', compact: '(max-width: 56.25rem)' }, context => {
      const moving = Boolean(context.conditions?.moving);
      const compact = Boolean(context.conditions?.compact);
      const playhead = { entry: 0, ink: 0, settle: 0 };
      const drift = { x: 0, y: 0, angle: 0 };
      let entryPoints: Point[] = [];
      let inkPoints: Point[] = [];
      let scale = .3;
      let rest: Point = { x: 0, y: 0 };
      let inView = false;
      let scrollActive = false;
      let idleRunning = false;
      let idle: gsap.core.Timeline | undefined;
      const updateIdle = () => {
        const shouldRun = moving && inView && !document.hidden && playhead.settle > 0;
        if (shouldRun === idleRunning) return;
        idleRunning = shouldRun;
        pen.style.willChange = shouldRun || scrollActive ? 'transform' : 'auto';
        if (shouldRun) idle?.play(); else idle?.pause();
      };
      const render = () => {
        if (!entryPoints.length || !inkPoints.length) return;
        const writing = playhead.ink > 0 || playhead.entry >= 1;
        const traced = pointAt(writing ? inkPoints : entryPoints, writing ? playhead.ink : playhead.entry);
        const settle = playhead.settle;
        // Idle blends out before reverse scrolling retracts the stroke: the nib stays exact.
        const ambient = settle * settle;
        const x = traced.x + (rest.x - traced.x) * settle + drift.x * ambient;
        const y = traced.y + (rest.y - traced.y) * settle + drift.y * ambient;
        const writingAngle = -3 + Math.sin(playhead.ink * Math.PI * 2) * 3;
        const angle = writingAngle + (-18 - writingAngle) * settle + drift.angle * ambient;
        // The artwork nib (18,542) is offset to local (0,0).
        pen.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scale(${scale})`;
        pen.style.opacity = moving ? String(Math.min(1, playhead.entry * 4)) : '1';
        stroke.setAttribute('stroke-dashoffset', String(moving ? 1 - playhead.ink : 0));
        updateIdle();
      };
      const measure = () => {
        const frame = journey.getBoundingClientRect();
        const title = heading.getBoundingClientRect();
        const width = frame.width;
        const height = title.height + 430;
        // Local SVG canvas bounds the ink repaint; geometry is independent of scroll.
        svg.style.top = `${title.top - frame.top - 100}px`;
        svg.style.height = `${height}px`;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        scale = compact ? Math.min(.27, width / 1800) : Math.min(.44, Math.max(.34, width / 3100));
        const left = compact ? 22 : Math.max(32, Math.min(84, width * .055));
        const curl = compact ? 28 : 46;
        const word = heading.querySelector('.events-title-word')!.getBoundingClientRect();
        // Reserve the enlarged blade's full sweep beside the wider title.
        const titleClearance = word.left - frame.left - scale * 335 - curl - 24;
        const right = compact ? Math.min(260, width * .42) : Math.min(width * .245, 340, titleClearance);
        // On stacked layouts the whole blade sits below the title, including idle lift.
        const y = 100 + title.height + (compact ? Math.max(130, scale * 560 + 26) : 125);
        approach.setAttribute('d', `M${-width * .3 - 120},${y + 45} C${-width * .13},${y + 48} ${left - 50},${y - 22} ${left},${y}`);
        stroke.setAttribute('d', `M${left},${y} C${left + 55},${y - 12} ${right - 50},${y + 14} ${right},${y} C${right + curl},${y - 16} ${right + curl},${y + 18} ${right + 15},${y + 18} C${right - 8},${y + 18} ${right - 10},${y + 5} ${right + 7},${y + 6}`);
        entryPoints = samplePath(approach);
        inkPoints = samplePath(stroke);
        rest = { x: right - (compact ? 22 : 12), y: y - 12 };
        if (!moving) Object.assign(playhead, { entry: 1, ink: 1, settle: 1 });
        render();
      };
      measure();
      if (moving) {
        // Three unequal, slow arcs feel less mechanical than a constant bounce.
        idle = gsap.timeline({ paused: true, repeat: -1, onUpdate: render, defaults: { ease: 'sine.inOut' } })
          .to(drift, { x: 2, y: -3, angle: .8, duration: 3.1 })
          .to(drift, { x: -1.8, y: 1.3, angle: -.65, duration: 3.7 })
          .to(drift, { x: 0, y: 0, angle: 0, duration: 3.4 });
        const sequence = gsap.timeline({ paused: true, onUpdate: render })
          .to(playhead, { entry: 1, duration: .24, ease: 'sine.inOut' })
          .to(playhead, { ink: 1, duration: .64, ease: 'sine.inOut' })
          .to(playhead, { settle: 1, duration: .22, ease: 'sine.inOut' });
        // Attach the completed sequence so breakpoint changes initialize at current scroll.
        ScrollTrigger.create({
          animation: sequence,
          trigger: events, start: 'top 95%', end: 'top 8%', scrub: 1.5,
          invalidateOnRefresh: true,
          onToggle: self => {
            scrollActive = self.isActive;
            pen.style.willChange = scrollActive || idleRunning ? 'transform' : 'auto';
          },
        });
      }
      const visibility = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        updateIdle();
      }, { rootMargin: '160px 0px' });
      visibility.observe(intro);
      document.addEventListener('visibilitychange', updateIdle);
      const resize = new ResizeObserver(measure);
      resize.observe(journey);
      let live = true;
      void document.fonts.ready.then(() => { if (live) measure(); });
      document.fonts.addEventListener('loadingdone', measure);
      ScrollTrigger.addEventListener('refreshInit', measure);
      return () => {
        live = false;
        idle?.kill();
        resize.disconnect();
        visibility.disconnect();
        document.removeEventListener('visibilitychange', updateIdle);
        document.fonts.removeEventListener('loadingdone', measure);
        ScrollTrigger.removeEventListener('refreshInit', measure);
        pen.style.removeProperty('will-change');
      };
    }, svg);
    return () => media.revert();
  }, []);

  return <svg ref={root} className="events-quill-scene" aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <path ref={approachRef} fill="none" stroke="none"/>
    <path ref={strokeRef} className="events-quill-stroke" pathLength="1" strokeDasharray="1" strokeDashoffset="1"/>
    <g ref={penRef} className="events-quill-pen">
      <image href={quill} x="-18" y="-542" width="320" height="560"/>
    </g>
  </svg>;
}
