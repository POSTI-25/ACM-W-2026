import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Editorial.css';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  name: string;
  number: string;
  title: string;
  line: string;
  description: string;
  artwork?: string;
  layout?: 'split' | 'type' | 'image';
  surface?: string;
  from?: string;
  children: ReactNode;
};

export default function EditorialChapter({
  name, number, title, line, description, artwork, layout = 'split', children,
  surface = '#fff9e9', from = surface,
}: Props) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const section = root.current;
    const header = section?.querySelector('header');
    if (!section || !header) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Finish the colour wash before the heading becomes the focal point.
      // Direct scrubbing keeps fast jumps and reverse scrolling in sync.
      gsap.fromTo(section, { '--chapter-surface': from }, {
        '--chapter-surface': surface, ease: 'sine.inOut',
        scrollTrigger: { trigger: section, start: 'top 110%', end: 'top 55%', scrub: true },
      });
      const reveal = gsap.timeline({
        scrollTrigger: { trigger: header, start: 'top 95%', end: 'top 30%', scrub: .45 },
      });
      reveal.fromTo(header.querySelector('.editorial-heading-copy'), { y: 64 }, {
        y: 0, duration: 1, ease: 'sine.out',
      });
      const illustration = header.querySelector('img');
      if (illustration) reveal.fromTo(illustration, { y: 86, rotation: -5 }, {
        y: 0, rotation: 0, duration: 1, ease: 'sine.inOut',
      }, .12);
    }, section);
    return () => media.revert();
  }, [from, surface]);

  return <section ref={root} id={name} className={`editorial-chapter editorial-chapter--${layout}`}
    style={{ '--chapter-surface': surface } as CSSProperties} aria-labelledby={`${name}-heading`}>
    <header className="editorial-heading">
      <div className="editorial-heading-copy">
        <p className="chapter-eyebrow"><span>{number}</span><span>{line}</span></p>
        <h2 id={`${name}-heading`} className="editorial-display">{title}</h2>
        <p className="editorial-deck">{description}</p>
      </div>
      {artwork && <img className="editorial-engraving" src={artwork} alt="" width="320" height="320" loading="lazy" decoding="async" />}
    </header>
    <div className="editorial-chapter-content">{children}</div>
  </section>;
}
