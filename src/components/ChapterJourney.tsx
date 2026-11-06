import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ChapterJourney.css';
import { EventsInkTrail } from './EventsQuill';

gsap.registerPlugin(ScrollTrigger);

export function Plane() {
  return <svg viewBox="0 0 220 180" fill="none"><path d="m16 72 187-51-66 141-35-62-86-28Zm86 28 101-79-79 99-22-20Zm22 20 13 42"/><path d="M21 139c28 21 60 14 62-3 3-22-40-24-40-1 0 28 54 39 82 23" strokeDasharray="3 6"/></svg>;
}

export function Spark() {
  return <svg viewBox="0 0 160 160" fill="none"><path d="M80 12c0 48-20 68-68 68 48 0 68 20 68 68 0-48 20-68 68-68-48 0-68-20-68-68Z"/><circle cx="80" cy="80" r="25"/><path d="m29 29 20 20m62 62 20 20M29 131l20-20m62-62 20-20"/></svg>;
}

export function Orbit({ label = 'ACM-W · VIT · IDEAS IN MOTION' }: { label?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="0 0 500 500" fill="none">
    <defs><path id={id} d="M250 52a198 198 0 1 1-.1 0"/></defs>
    <circle cx="250" cy="250" r="234"/><circle cx="250" cy="250" r="218" strokeDasharray="2 9"/><circle cx="250" cy="250" r="168"/>
    <ellipse cx="250" cy="250" rx="93" ry="168"/><ellipse cx="250" cy="250" rx="168" ry="64"/><path d="M82 250h336M250 82v336"/>
    <text><textPath href={`#${id}`} startOffset="8%">{label}</textPath></text>
    <path d="m250 216 8 26 26 8-26 8-8 26-8-26-26-8 26-8Z" fill="currentColor" stroke="none"/>
  </svg>;
}

export function SealedLetter() {
  return <svg viewBox="0 0 240 190" fill="none">
    <rect x="13" y="30" width="214" height="143" rx="5" fill="#fff9e9" fillOpacity=".3"/>
    <path d="m13 30 101 82q6 5 12 0l101-82M13 173l84-74m130 74-84-74"/>
    <circle cx="120" cy="111" r="19" fill="currentColor" fillOpacity=".18"/>
    <circle cx="120" cy="111" r="14"/><path d="m120 101 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>
  </svg>;
}

const route = 'M790 -40C1090 150 210 210 340 480S1060 700 850 940 130 1050 300 1330 1090 1550 880 1810 120 2020 370 2440';

/** A background-only layer: it never pins, transforms, or measures a card. */
export default function ChapterJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const maskId = useId().replace(/:/g, '');

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element);
      // Animate the normalized SVG attribute, avoiding CSS pixel rounding.
      gsap.fromTo(select('[data-route-reveal]'), { attr: { 'stroke-dashoffset': 1 } }, {
        attr: { 'stroke-dashoffset': 0 }, ease: 'none',
        scrollTrigger: { trigger: element, start: 'top 70%', end: 'bottom 60%', scrub: .7 },
      });
    }, element);
    return () => media.revert();
  }, []);

  return <div className="chapter-journey" ref={root}>
    <div className="journey-backdrop" aria-hidden="true">
      <svg className="journey-route" viewBox="0 0 1200 2400" preserveAspectRatio="none" fill="none">
        <defs><mask id={maskId}><path data-route-reveal d={route} pathLength="1" stroke="white" strokeWidth="14" strokeDasharray="1"/></mask></defs>
        <path d={route} className="journey-route-ghost"/>
        <path d={route} className="journey-route-ink" mask={`url(#${maskId})`}/>
      </svg>
      <i className="journey-route-dot journey-route-dot--one"/><i className="journey-route-dot journey-route-dot--two"/>
      <EventsInkTrail />
    </div>
    {children}
  </div>;
}

/** A quieter reprise of the postal route before the reading room. */
export function ChapterTrail() {
  return <div className="chapter-trail" aria-hidden="true">
    <svg viewBox="0 0 1200 180" preserveAspectRatio="none" fill="none"><path d="M-30 30C300-80 310 230 620 120S970 20 1230 160"/></svg>
  </div>;
}
