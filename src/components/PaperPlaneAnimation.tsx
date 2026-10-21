import { useId, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

type FlightPoint = { x: number; y: number; angle: number };
const SAMPLES = 360;

/** Arc-length samples keep velocity even; unwrap tangents to avoid rotation snaps. */
function sampleFlight(path: SVGPathElement) {
  const length = path.getTotalLength();
  let previous = 0;
  const points: FlightPoint[] = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const distance = length * i / SAMPLES;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - .5));
    const after = path.getPointAtLength(Math.min(length, distance + .5));
    let angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    if (i) {
      while (angle - previous > 180) angle -= 360;
      while (angle - previous < -180) angle += 360;
    }
    previous = angle;
    return { x: point.x, y: point.y, angle };
  });
  return { points, length };
}

export default function PaperPlaneAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const maskId = `award-flight-${useId().replace(/:/g, '')}`;

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const route = routeRef.current;
    const plane = planeRef.current;
    const stage = svg?.closest<HTMLElement>('[data-award-card]');
    const banner = stage?.querySelector<HTMLElement>('[data-award-banner]');
    if (!svg || !route || !plane || !stage || !banner) return;

    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, context => {
      const moving = Boolean(context.conditions?.moving);
      const playhead = { progress: moving ? 0 : .24 };
      const paths = svg.querySelectorAll<SVGPathElement>('[data-flight-path]');
      const tails = svg.querySelectorAll<SVGPathElement>('[data-flight-tail]');
      let points: FlightPoint[] = [];
      let scale = 1;
      let inView = false;
      let flight: gsap.core.Tween | undefined;
      let float: gsap.core.Tween | undefined;
      const render = () => {
        if (!points.length) return;
        const sample = playhead.progress * SAMPLES;
        const index = Math.min(SAMPLES - 1, Math.floor(sample));
        const blend = sample - index;
        const a = points[index], b = points[index + 1];
        const x = a.x + (b.x - a.x) * blend;
        const y = a.y + (b.y - a.y) * blend;
        const angle = a.angle + (b.angle - a.angle) * blend;
        plane.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scale(${scale})`;
        plane.style.opacity = '1';
        // Three fading segments follow the nose; the route never accumulates heavy ink.
        tails.forEach((tail, i) => tail.setAttribute('stroke-dashoffset', String((i + 1) * .035 - playhead.progress)));
      };
      const measure = () => {
        const frame = stage.getBoundingClientRect();
        const paper = banner.getBoundingClientRect();
        const width = frame.width;
        const compact = width <= 640;
        scale = compact ? .78 : Math.min(1.15, Math.max(.9, width / 1250));
        // Keep both passes in the paper margins, clear of lettering and its small float.
        const top = Math.max(26, paper.top - frame.top - (compact ? 24 : 28));
        const bottom = paper.bottom - frame.top + (compact ? 30 : 34);
        const d = `M-55 ${top} C${width * .24} ${top - 26} ${width * .74} ${top + 22} ${width + 25} ${top} C${width + 112} ${top} ${width + 112} ${bottom} ${width + 25} ${bottom} C${width * .74} ${bottom + 26} ${width * .24} ${bottom - 22} -25 ${bottom} C-112 ${bottom} -112 ${top} -55 ${top}Z`;
        svg.setAttribute('viewBox', `0 0 ${width} ${frame.height}`);
        paths.forEach(path => path.setAttribute('d', d));
        const sampled = sampleFlight(route);
        points = sampled.points;
        if (flight) {
          const progress = flight.progress();
          flight.duration(Math.max(12, Math.min(24, sampled.length / 190))).progress(progress);
        }
        render();
        return sampled.length;
      };
      const length = measure();
      if (moving) {
        flight = gsap.to(playhead, {
          progress: 1, duration: Math.max(12, Math.min(24, length / 190)),
          ease: 'none', repeat: -1, paused: true, onUpdate: render,
        });
        float = gsap.fromTo(banner, { y: -3 }, {
          y: 3, duration: 4.8, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
        });
      }
      const updatePlayback = () => {
        const active = moving && inView && !document.hidden;
        if (active) { flight?.play(); float?.play(); }
        else { flight?.pause(); float?.pause(); }
        plane.style.willChange = active ? 'transform' : 'auto';
        banner.style.willChange = active ? 'transform' : 'auto';
      };
      const visibility = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        updatePlayback();
      }, { rootMargin: '120px 0px' });
      visibility.observe(stage);
      document.addEventListener('visibilitychange', updatePlayback);
      const resize = new ResizeObserver(measure);
      resize.observe(stage);
      let live = true;
      void document.fonts.ready.then(() => { if (live) measure(); });
      document.fonts.addEventListener('loadingdone', measure);
      return () => {
        live = false;
        flight?.kill();
        float?.kill();
        visibility.disconnect();
        resize.disconnect();
        document.removeEventListener('visibilitychange', updatePlayback);
        document.fonts.removeEventListener('loadingdone', measure);
        plane.style.removeProperty('will-change');
        banner.style.removeProperty('will-change');
      };
    }, svg);
    return () => media.revert();
  }, []);

  return <svg ref={svgRef} className="award-flight" aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <defs>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-140" y="0" width="200%" height="100%">
        {[1, .45, .15].map((opacity, index) => <path key={index} data-flight-path data-flight-tail pathLength="1" fill="none" stroke="white" strokeWidth="5" strokeDasharray=".035 .965" opacity={opacity}/>)}
      </mask>
    </defs>
    <path ref={routeRef} data-flight-path className="award-flight-route"/>
    <path data-flight-path className="award-flight-trail" mask={`url(#${maskId})`}/>
    <g ref={planeRef} className="award-flight-plane">
      <path d="M-30-16 33 0-25 23-16 4Z" fill="#211c18"/>
      <path d="M-30-16-16 4 33 0M-16 4-25 23-5 9" fill="none" stroke="#dccab2" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M-30-16 33 0-25 23-16 4Z" fill="none" stroke="#211c18" strokeWidth=".7" strokeLinejoin="round"/>
    </g>
  </svg>;
}
