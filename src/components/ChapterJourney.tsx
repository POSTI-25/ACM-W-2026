import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import featherSilhouette from '../assets/decor/black-feather.svg';
import spilledInk from '../assets/decor/spilled-ink.svg';
import './ChapterJourney.css';

gsap.registerPlugin(ScrollTrigger);

function Plane() {
  return <svg viewBox="0 0 220 180" fill="none"><path d="m16 72 187-51-66 141-35-62-86-28Zm86 28 101-79-79 99-22-20Zm22 20 13 42"/><path d="M21 139c28 21 60 14 62-3 3-22-40-24-40-1 0 28 54 39 82 23" strokeDasharray="3 6"/></svg>;
}

function Spark() {
  return <svg viewBox="0 0 160 160" fill="none"><path d="M80 12c0 48-20 68-68 68 48 0 68 20 68 68 0-48 20-68 68-68-48 0-68-20-68-68Z"/><circle cx="80" cy="80" r="25"/><path d="m29 29 20 20m62 62 20 20M29 131l20-20m62-62 20-20"/></svg>;
}

function Orbit({ label = 'ACM-W · VIT · IDEAS IN MOTION' }: { label?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="0 0 500 500" fill="none">
    <defs><path id={id} d="M250 52a198 198 0 1 1-.1 0"/></defs>
    <circle cx="250" cy="250" r="234"/><circle cx="250" cy="250" r="218" strokeDasharray="2 9"/><circle cx="250" cy="250" r="168"/>
    <ellipse cx="250" cy="250" rx="93" ry="168"/><ellipse cx="250" cy="250" rx="168" ry="64"/><path d="M82 250h336M250 82v336"/>
    <text><textPath href={`#${id}`} startOffset="8%">{label}</textPath></text>
    <path d="m250 216 8 26 26 8-26 8-8 26-8-26-26-8 26-8Z" fill="currentColor" stroke="none"/>
  </svg>;
}

function SealedLetter() {
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
    const events = element?.querySelector<HTMLElement>('#events');
    if (!element || !events) return;
    const measure = () => {
      const y = events.offsetTop + innerHeight * .24;
      const radius = Math.hypot(element.clientWidth / 2, Math.max(y, element.offsetHeight - y));
      element.style.setProperty('--journey-events-y', `${events.offsetTop}px`);
      element.style.setProperty('--journey-portal-y', `${y}px`);
      element.style.setProperty('--journey-diameter', `${Math.ceil(radius * 2 + 80)}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element);
      const colorReveal = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        // One continuous timeline retraces on upward scroll; no one-shot resets.
        scrollTrigger: { trigger: events, start: 'top bottom', end: 'top -85%', scrub: 1.6, invalidateOnRefresh: true },
      });
      // Stagger the surfaces so three distinct bands sweep through the viewport.
      ['tan', 'rose', 'cream'].forEach((color, index) => {
        colorReveal.fromTo(select(`.journey-color-disc--${color}`), { scale: .018 }, {
          scale: 1, duration: 1,
        }, index * .22);
      });
      gsap.fromTo(select('.journey-portal-art'), { rotation: -65, scale: .72 }, {
        rotation: 35, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: events, start: 'top bottom', end: 'top -110%', scrub: 1.6 },
      });
      // Animate the normalized SVG attribute, avoiding CSS pixel rounding.
      gsap.fromTo(select('[data-route-reveal]'), { attr: { 'stroke-dashoffset': 1 } }, {
        attr: { 'stroke-dashoffset': 0 }, ease: 'none',
        scrollTrigger: { trigger: element, start: 'top 70%', end: 'bottom 60%', scrub: .7 },
      });
      // Bound drift to the title surround; solid artwork never reaches event copy.
      element.querySelectorAll<HTMLElement>('[data-stationery]').forEach(asset => {
        const quill = asset.dataset.stationery === 'quill';
        gsap.fromTo(asset, { y: () => Math.min(24, innerWidth * .035), rotation: quill ? -5 : 3 }, {
          y: () => -Math.min(24, innerWidth * .035), rotation: quill ? 6 : -3, ease: 'none',
          scrollTrigger: { trigger: events, start: 'top bottom', end: 'top -30%', scrub: 1.5, invalidateOnRefresh: true },
        });
      });
      element.querySelectorAll<HTMLElement>('[data-journey-drift]').forEach((asset, index) => {
        const depth = Number(asset.dataset.journeyDrift);
        gsap.fromTo(asset, { y: () => innerHeight * .16 * depth, rotation: index % 2 ? 12 : -14 }, {
          y: () => -innerHeight * .36 * depth, rotation: index % 2 ? -18 : 16, ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 1.3, invalidateOnRefresh: true },
        });
      });
    }, element);
    window.addEventListener('resize', measure, { passive: true });
    return () => { resize.disconnect(); window.removeEventListener('resize', measure); media.revert(); };
  }, []);

  return <div className="chapter-journey" ref={root}>
    <div className="journey-backdrop" aria-hidden="true">
      <div className="journey-color-anchor">
        <div className="journey-color-disc journey-color-disc--tan"/>
        <div className="journey-color-disc journey-color-disc--rose"/>
        <div className="journey-color-disc journey-color-disc--cream"/>
      </div>
      <svg className="journey-route" viewBox="0 0 1200 2400" preserveAspectRatio="none" fill="none">
        <defs><mask id={maskId}><path data-route-reveal d={route} pathLength="1" stroke="white" strokeWidth="14" strokeDasharray="1"/></mask></defs>
        <path d={route} className="journey-route-ghost"/>
        <path d={route} className="journey-route-ink" mask={`url(#${maskId})`}/>
      </svg>
      <div className="journey-portal"><div className="journey-portal-art"><Orbit/></div></div>
      <div className="journey-asset journey-asset--spark" data-journey-drift=".7"><Spark/></div>
      <div className="journey-asset journey-asset--quill" data-stationery="quill"><img src={featherSilhouette} alt="" width={260} height={560} decoding="async" draggable={false}/></div>
      <div className="journey-asset journey-asset--ink" data-stationery="ink"><img src={spilledInk} alt="" width={380} height={240} decoding="async" draggable={false}/></div>
      <div className="journey-asset journey-asset--orbit" data-journey-drift=".65"><Orbit label="CREATE · CONNECT · EXPLORE"/></div>
      <div className="journey-asset journey-asset--letter" data-journey-drift="1.3"><SealedLetter/></div>
      <div className="journey-asset journey-asset--send" data-journey-drift="1.8"><Plane/></div>
      <i className="journey-route-dot journey-route-dot--one"/><i className="journey-route-dot journey-route-dot--two"/>
    </div>
    {children}
  </div>;
}

/** A quieter reprise of the postal route before the reading room. */
export function ChapterTrail() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(root.current);
      gsap.fromTo(select('.chapter-trail-seal'), { y: 32, rotation: -25 }, {
        y: -28, rotation: 25, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }, root);
    return () => media.revert();
  }, []);
  return <div ref={root} className="chapter-trail" aria-hidden="true">
    <svg viewBox="0 0 1200 180" preserveAspectRatio="none" fill="none"><path d="M-30 30C300-80 310 230 620 120S970 20 1230 160"/></svg>
    <div className="chapter-trail-seal"><Spark/></div>
  </div>;
}
