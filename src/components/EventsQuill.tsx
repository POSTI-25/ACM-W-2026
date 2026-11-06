import { useId, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import quill from '../assets/decor/black-feather.svg';
import artwork from '../assets/decor/events-quote.json';
import './EventsQuill.css';

gsap.registerPlugin(ScrollTrigger);
const clamp = gsap.utils.clamp(0, 1);
const pools = [[.08, .45], [.36, .25], [.68, .72]];
const left = Math.min(...artwork.glyphs.map(glyph => glyph.bounds[0]));
const right = Math.max(...artwork.glyphs.map(glyph => glyph.bounds[0] + glyph.bounds[2]));
const span = right - left;
const at = (fraction: number) => left + span * fraction;
// One rising ribbon with a loose loop; independent of the lettering's outlines.
const flourish = `M${left - 32} 288
  C${left - 28} 226 ${at(.025)} 214 ${at(.075)} 236
  S${at(.16)} 288 ${at(.205)} 254
  C${at(.25)} 220 ${at(.305)} 154 ${at(.325)} 98
  C${at(.348)} 30 ${at(.385)} 70 ${at(.345)} 143
  C${at(.30)} 232 ${at(.35)} 288 ${at(.395)} 250
  C${at(.445)} 214 ${at(.47)} 191 ${at(.525)} 209
  S${at(.66)} 250 ${at(.72)} 185
  C${at(.76)} 164 ${at(.765)} 108 ${at(.805)} 116
  S${at(.915)} 157 ${right + 28} 92`;

export function EventsInkTrail() {
  return <svg className="journey-flourish" viewBox={`${left - 40} 0 ${span + 80} 320`} fill="none" focusable="false">
    <path className="journey-flourish-ink" data-route-reveal d={flourish} pathLength="1" strokeDasharray="1" />
  </svg>;
}

/** One continuous flourish releases a trailing, left-to-right seep of ink. */
export default function EventsQuill() {
  const root = useRef<SVGSVGElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const letteringRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const id = useId().replace(/:/g, '');

  useLayoutEffect(() => {
    const svg = root.current;
    const pen = penRef.current;
    const lettering = letteringRef.current;
    const trail = trailRef.current;
    const journey = svg?.closest('.chapter-journey');
    const cards = journey?.querySelector<HTMLElement>('.events-cards');
    const events = cards?.closest('#events');
    if (!svg || !pen || !lettering || !trail || !journey || !cards || !events) return;

    const masks = Array.from(svg.querySelectorAll<SVGMaskElement>('[data-ink-mask]')).map(mask => ({
      pool: mask.querySelector<SVGGElement>('[data-ink-pools]')!,
      circles: Array.from(mask.querySelectorAll<SVGCircleElement>('circle')),
      settled: mask.querySelector<SVGRectElement>('[data-ink-settled]')!,
    }));
    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, context => {
      const moving = Boolean(context.conditions?.moving);
      const ink = artwork.glyphs.map(() => ({ progress: moving ? 0 : 1 }));
      const length = trail.getTotalLength();
      const points = Array.from({ length: 301 }, (_, index) => {
        const point = trail.getPointAtLength(length * index / 300);
        return { x: point.x, y: point.y };
      });
      const motion = { progress: 0 };
      const pose = { x: points[0].x, y: points[0].y, tilt: -23, visibility: 0 };
      let width = 1, height = 1;
      let matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
      let trigger: ScrollTrigger | undefined;
      let sequence: gsap.core.Timeline | undefined;
      let requested = false, completed = false;
      let inView = false;
      const renderInk = (index: number) => {
        const progress = ink[index].progress;
        const mask = masks[index];
        mask.pool.style.display = progress >= 1 ? 'none' : '';
        mask.settled.style.display = progress >= 1 ? '' : 'none';
        const [x, y, w, h] = artwork.glyphs[index].bounds;
        const radius = Math.hypot(w, h) * 1.5;
        mask.circles.forEach((circle, seed) => {
          const bloom = clamp((progress - seed * .095) / (1 - seed * .095));
          circle.setAttribute('cx', String(x + w * pools[seed][0]));
          circle.setAttribute('cy', String(y + h * pools[seed][1]));
          circle.setAttribute('r', String(radius * bloom * bloom));
        });
      };
      const renderPen = () => {
        const x = matrix.a * pose.x + matrix.c * pose.y + matrix.e;
        const y = matrix.b * pose.x + matrix.d * pose.y + matrix.f;
        const scale = Math.min(.62, width / 1050, height / 1050);
        pen.setAttribute('transform', `translate(${x} ${y}) rotate(${pose.tilt}) scale(${scale})`);
        pen.style.opacity = String(moving ? pose.visibility * .46 : 0);
        trail.style.opacity = String(moving ? pose.visibility * .16 : 0);
        trail.setAttribute('stroke-dashoffset', String(1 - motion.progress));
      };
      const renderMotion = () => {
        const position = motion.progress * (points.length - 1);
        const index = Math.min(points.length - 2, Math.floor(position));
        const mix = position - index;
        pose.x = points[index].x + (points[index + 1].x - points[index].x) * mix;
        pose.y = points[index].y + (points[index + 1].y - points[index].y) * mix;
        pose.tilt = -23 + Math.sin(motion.progress * Math.PI * 3) * 8;
        renderPen();
      };
      const followViewport = () => {
        if (!trigger) return;
        const y = gsap.utils.clamp(0, trigger.end - trigger.start, trigger.scroll() - trigger.start);
        svg.style.transform = `translate3d(0, ${y}px, 0)`;
      };
      // Preserve the established diagonal fit and viewport placement.
      const sceneTop = () => Math.max(cards.getBoundingClientRect().top - innerHeight * .85,
        events.getBoundingClientRect().top - innerHeight * .12);
      const measure = () => {
        const frame = journey.getBoundingClientRect();
        width = frame.width;
        height = innerHeight;
        svg.style.top = `${(moving ? sceneTop() : cards.getBoundingClientRect().top) - frame.top}px`;
        if (!moving) svg.style.removeProperty('transform');
        svg.style.height = `${height}px`;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        const angle = -Math.atan2(height * .56, width * .8);
        const cos = Math.cos(angle), sin = Math.sin(angle);
        const box = lettering.getBBox();
        const scale = Math.min(width * .89 / (box.width * cos - box.height * sin),
          height * .805 / (-box.width * sin + box.height * cos));
        const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
        matrix = { a: scale*cos, b: scale*sin, c: -scale*sin, d: scale*cos,
          e: width*.5-scale*(cos*cx-sin*cy), f: height*.55-scale*(sin*cx+cos*cy) };
        const transform = `matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`;
        lettering.setAttribute('transform', transform);
        trail.setAttribute('transform', transform);
        renderPen();
        followViewport();
      };
      const updatePlayback = () => {
        if (!sequence) return;
        if (inView && !document.hidden && requested && !completed) sequence.play();
        else sequence.pause();
      };
      ink.forEach((_, index) => renderInk(index));
      measure();
      if (moving) {
        const travelDuration = 4.8;
        const travelAt = .12;
        sequence = gsap.timeline({ paused: true, onComplete: () => { completed = true; } });
        sequence.to(pose, { visibility: 1, duration: .35, ease: 'sine.inOut', onUpdate: renderPen }, 0);
        sequence.to(motion, { progress: 1, duration: travelDuration,
          ease: 'sine.inOut', onUpdate: renderMotion }, travelAt);
        let previousRelease = 0;
        artwork.glyphs.forEach((glyph, index) => {
          // Wait until the flourish has passed this letter, including its return through the loop.
          const threshold = glyph.bounds[0] + glyph.bounds[2] * .12;
          let lastPass = 0;
          points.forEach((point, sample) => { if (point.x <= threshold) lastPass = sample; });
          const progress = clamp(lastPass / (points.length - 1));
          // Invert the feather's sine easing so the ink consistently trails the nib.
          const passedAt = travelAt + travelDuration * Math.acos(1 - 2 * progress) / Math.PI;
          const release = Math.max(previousRelease + .045, passedAt + .1);
          previousRelease = release;
          sequence!.to(ink[index], { progress: 1, duration: .85, ease: 'sine.inOut',
            onUpdate: () => renderInk(index) }, release);
        });
        sequence.to(pose, { visibility: 0, tilt: -13, y: points.at(-1)!.y - 22,
          duration: .65, ease: 'sine.inOut', onUpdate: renderPen }, travelAt + travelDuration);
        trigger = ScrollTrigger.create({
          trigger: cards, start: () => sceneTop() + window.scrollY, end: 'bottom 80%',
          invalidateOnRefresh: true,
          onUpdate: self => {
            followViewport();
            // Start the full sentence once; scrolling never inserts word pauses.
            if (self.progress > 0) requested = true;
            updatePlayback();
          },
          onRefresh: self => {
            followViewport();
            if (self.progress > 0) requested = true;
            updatePlayback();
          },
        });
        followViewport();
      }
      const visibility = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        updatePlayback();
      });
      visibility.observe(cards);
      document.addEventListener('visibilitychange', updatePlayback);
      const resize = new ResizeObserver(() => ScrollTrigger.refresh());
      resize.observe(cards);
      ScrollTrigger.addEventListener('refreshInit', measure);
      return () => {
        sequence?.kill();
        trigger?.kill();
        visibility.disconnect();
        resize.disconnect();
        document.removeEventListener('visibilitychange', updatePlayback);
        svg.style.removeProperty('transform');
        ScrollTrigger.removeEventListener('refreshInit', measure);
      };
    }, svg);
    return () => media.revert();
  }, []);

  return <svg ref={root} className="events-quill-scene" aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <defs>
      <radialGradient id={`${id}-pool`}>
        <stop offset="0" stopColor="white" />
        <stop offset=".68" stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
      {artwork.glyphs.map((glyph, index) => {
        const [x, y, width, height] = glyph.bounds;
        return <g key={index}>
          <filter id={`${id}-grain-${index}`} filterUnits="userSpaceOnUse" x={x - 8} y={y - 8} width={width + 16} height={height + 16} colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".045 .075" numOctaves="2" seed={index % 7 + 1} result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="5" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation=".55" />
          </filter>
          <mask data-ink-mask id={`${id}-ink-${index}`} maskUnits="userSpaceOnUse" x={x - 8} y={y - 8} width={width + 16} height={height + 16}>
            <g data-ink-pools filter={`url(#${id}-grain-${index})`}>
              {pools.map((_, seed) => <circle key={seed} r="0" fill={`url(#${id}-pool)`} />)}
            </g>
            <rect data-ink-settled x={x - 8} y={y - 8} width={width + 16} height={height + 16} fill="white" style={{ display: 'none' }} />
          </mask>
        </g>;
      })}
    </defs>
    <path ref={trailRef} className="events-quill-trail" d={flourish} pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
    <g ref={letteringRef} className="events-quill-lettering">
      {artwork.glyphs.map((glyph, index) => <path className="events-quill-ink" key={index} d={glyph.d} mask={`url(#${id}-ink-${index})`} />)}
    </g>
    <g ref={penRef} className="events-quill-pen">
      <image href={quill} x="-18" y="-542" width="320" height="560" />
    </g>
  </svg>;
}
