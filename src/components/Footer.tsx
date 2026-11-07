import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Gallery.css';

gsap.registerPlugin(ScrollTrigger);

const photoModules = import.meta.glob<{ default: string }>(
  '../assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true },
);
const photos = Object.entries(photoModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([file, module], index) => ({
    src: module.default,
    width: file.includes('23.00.45') ? 1280 : 1600,
    height: file.includes('23.00.45') ? 963 : 1200,
    number: String(index + 1).padStart(2, '0'),
  }));
const passages = [
  { title: 'In good company.', text: 'A chapter is made of the people who show up.' },
  { title: 'Ideas find their people.', text: 'Conversations, collaborations, and everything in between.' },
  { title: 'More than a moment.', text: 'The stories we take with us.' },
];
const spreads = Array.from({ length: Math.ceil(photos.length / 3) }, (_, index) => photos.slice(index * 3, index * 3 + 3));

/** The Gallery lives in normal page flow; all photographs remain available. */
export default function Gallery() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 48rem)' }, context => {
      if (!context.conditions?.moving) return;
      const wide = Boolean(context.conditions.wide);
      element.querySelectorAll<HTMLElement>('.gallery-print').forEach((print, index) => {
        const slot = index % 3;
        const tilt = wide ? [-1.6, 2, -1.1][slot] : 0;
        const motion = gsap.timeline({
          scrollTrigger: { trigger: print, start: 'top 105%', end: 'bottom top', scrub: .5, invalidateOnRefresh: true },
        });
        motion.fromTo(print, {
          y: () => (wide ? 66 : 28) + slot * (wide ? 20 : 6),
          x: wide ? (slot === 1 ? 22 : -14) : 0,
          rotation: tilt + (wide ? (slot === 1 ? 3 : -2) : 0),
          '--photo-lift': 1,
        }, {
          x: 0, y: 0, rotation: tilt, '--photo-lift': 0,
          duration: .44, ease: 'sine.out',
        }, 0)
          // Hold the composition for reading, then let the layers glide apart.
          .to(print, { y: wide ? -26 - slot * 10 : -10, duration: .25, ease: 'none' }, .75);
      });
    }, element);
    return () => media.revert();
  }, []);

  return <div ref={root} className="gallery-story">
    {spreads.map((spread, index) => {
      const passage = passages[index % passages.length];
      return <div className="gallery-spread" key={spread[0].src}>
        <p className="gallery-spread-index">FROM THE ARCHIVE / {String(index + 1).padStart(2, '0')}</p>
        {spread.map((photo, slot) => <figure className={`gallery-print gallery-print--${slot}`} key={photo.src}>
          <div className="gallery-image">
            <img src={photo.src} width={photo.width} height={photo.height}
              alt={`ACM-W VIT chapter archive photograph ${photo.number}`} loading="lazy" decoding="async" />
          </div>
          <figcaption><span>ACM-W / VIT</span><span>ARCHIVE {photo.number}</span></figcaption>
        </figure>)}
        <div className="gallery-margin-note">
          <p>{passage.title}</p>
          <span>{passage.text}</span>
        </div>
      </div>;
    })}
  </div>;
}
