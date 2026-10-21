import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import quill from '../assets/decor/black-feather.svg';
import './EventsQuill.css';

gsap.registerPlugin(ScrollTrigger);

type Point = { x: number; y: number };
const SAMPLE_COUNT = 240;

/** Sample once on layout/refresh, never read SVG geometry during a frame. */
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

/** One scrubbed playhead owns the nib position and the exact ink endpoint. */
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
    const heading = events?.querySelector<HTMLElement>('h1');
    const bottle = journey?.querySelector<HTMLElement>('[data-stationery="ink"]');
    if (!svg || !approach || !stroke || !pen || !journey || !events || !heading) return;

    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)', compact: '(max-width: 48rem)' }, context => {
      const moving = Boolean(context.conditions?.moving);
      const compact = Boolean(context.conditions?.compact);
      const playhead = { entry: 0, ink: 0, lift: 0 };
      let entryPoints: Point[] = [];
      let inkPoints: Point[] = [];
      let scale = .35;
      let rest: Point = { x: 0, y: 0 };
      let sceneWidth = 0;
      let titleRight = 0;
      const render = () => {
        if (!entryPoints.length || !inkPoints.length) return;
        const writing = playhead.ink > 0 || playhead.entry >= 1;
        let point = pointAt(writing ? inkPoints : entryPoints, writing ? playhead.ink : playhead.entry);
        const lift = playhead.lift;
        point = { x: point.x + (rest.x - point.x) * lift, y: point.y + (rest.y - point.y) * lift };
        // Turn the quill upright as the nib approaches a narrow screen edge.
        const turn = gsap.utils.clamp(0, 1, compact
          ? (point.x - (sceneWidth - 170)) / 100
          : (point.x - (titleRight - 80)) / 100);
        const edgeTurn = .5 - Math.cos(turn * Math.PI) / 2;
        const writingAngle = 77 + Math.sin(playhead.ink * Math.PI * 2) * 3 - edgeTurn * (compact ? 102 : 48);
        const angle = writingAngle + ((compact ? -25 : -18) - writingAngle) * lift;
        // The artwork's nib is exactly (18, 542); image offset makes it local (0, 0).
        pen.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle}) scale(${scale})`);
        pen.style.opacity = moving ? String(Math.min(1, playhead.entry * 3)) : '1';
        stroke.setAttribute('stroke-dashoffset', String(moving ? 1 - playhead.ink : 0));
      };
      const measure = () => {
        const frame = svg.getBoundingClientRect();
        const title = heading.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(heading);
        const text = range.getBoundingClientRect();
        titleRight = text.right - frame.left;
        const bottleRight = bottle ? bottle.getBoundingClientRect().right - frame.left : 0;
        const width = frame.width;
        sceneWidth = width;
        const height = frame.height;
        scale = compact ? Math.min(.18, width / 2200) : Math.min(.4, Math.max(.28, width / 3300));
        const left = compact ? Math.max(20, text.left - frame.left - 15)
          : Math.max(text.left - frame.left - 26, bottleRight + 30);
        const right = Math.min(text.right - frame.left, width - (compact ? 90 : 165));
        // Above the title on narrow screens keeps the blade and bottle clear.
        const y = compact ? title.top - frame.top - 46 : title.bottom - frame.top + 27;
        const approachSide = compact ? -1 : 1;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        approach.setAttribute('d', `M${width + 100},${y + approachSide * 48} C${width * .8},${y + approachSide * 90} ${left + 70},${y + approachSide * 75} ${left},${y}`);
        stroke.setAttribute('d', `M${left},${y} C${left + 65},${y + 19} ${right - 65},${y + 23} ${right + 18},${y + 5} C${right + 77},${y - 8} ${right + 68},${y + 35} ${right + 29},${y + 35} C${right + 3},${y + 35} ${right - 4},${y + 19} ${right + 14},${y + 17}`);
        entryPoints = samplePath(approach);
        inkPoints = samplePath(stroke);
        rest = { x: compact ? width - 35 : right + 65, y: y + 14 };
        if (!moving) Object.assign(playhead, { entry: 1, ink: 1, lift: 1 });
        render();
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(journey);
      let live = true;
      void document.fonts.ready.then(() => { if (live) measure(); });
      document.fonts.addEventListener('loadingdone', measure);
      ScrollTrigger.addEventListener('refreshInit', measure);
      if (moving) {
        gsap.timeline({
          onUpdate: render,
          scrollTrigger: {
            trigger: events, start: 'top 95%', end: 'top -30%', scrub: 1.6,
            invalidateOnRefresh: true,
            onToggle: self => { pen.style.willChange = self.isActive ? 'transform' : 'auto'; },
          },
        })
          .to(playhead, { entry: 1, duration: .25, ease: 'sine.inOut' })
          .to(playhead, { ink: 1, duration: .62, ease: 'sine.inOut' })
          .to(playhead, { lift: 1, duration: .23, ease: 'sine.inOut' });
      }
      return () => {
        live = false;
        observer.disconnect();
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
