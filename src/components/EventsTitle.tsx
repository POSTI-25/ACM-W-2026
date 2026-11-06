import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TRANSITION_SCRUB } from '../lib/smoothScroll';
import './EventsTitle.css';

gsap.registerPlugin(ScrollTrigger);
const LETTER_WIDTH: Record<string, string> = {
  A: '.82em', B: '.80em', C: '.82em', D: '.86em', E: '.74em', F: '.72em',
  G: '.82em', H: '.86em', I: '.44em', J: '.64em', K: '.84em', L: '.70em',
  M: '1.02em', N: '.80em', O: '.82em', P: '.78em', Q: '.88em', R: '.84em',
  S: '.72em', T: '.74em', U: '.86em', V: '.84em', W: '1.12em', X: '.84em',
  Y: '.84em', Z: '.78em',
};

/** A steady left half and individually rolling right-hand letters on each line. */
export function RollingSectionTitle({ word, sectionId, lines, staticLetters, as: Heading = 'h1', description }: {
  word: string;
  sectionId: string;
  lines?: readonly string[];
  staticLetters?: number;
  as?: 'h1' | 'h2';
  description?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const rows = lines ?? [word];
  const longestLine = Math.max(...rows.map(line => line.length));
  const titleStyle = {
    '--title-fluid-size': `${Math.min(18, 82 / (longestLine * .75))}vw`,
  } as CSSProperties;

  useLayoutEffect(() => {
    const intro = root.current;
    const stage = intro?.closest('.section-color-fan-stage');
    const events = stage ?? intro?.closest(`#${sectionId}`);
    if (!intro || !events) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: events,
          start: stage ? 'top top' : 'top 88%',
          end: stage ? 'bottom bottom' : 'top 18%',
          scrub: stage ? TRANSITION_SCRUB : 1.15,
          invalidateOnRefresh: true,
          onToggle: self => {
            if (stage) return; // The shared stage prepares its nearby layers.
            intro.querySelectorAll<HTMLElement>('[data-dial-track]').forEach(track => {
              track.style.willChange = self.isActive ? 'transform' : 'auto';
            });
          },
        },
      });
      const dials = intro.querySelectorAll<HTMLElement>('[data-dial]');
      // Keep the same gentle .24-wide ripple even for a long, two-line title.
      // Events and Blogs retain their original three-letter .12 stagger.
      const stagger = dials.length > 1 ? .24 / (dials.length - 1) : 0;
      dials.forEach((dial, index) => {
        const track = dial.querySelector('[data-dial-track]');
        const modern = dial.querySelectorAll('[data-face="modern"]');
        const serif = dial.querySelectorAll('[data-face="serif"]');
        const ornate = dial.querySelectorAll('[data-face="ornate"]');
        if (!track) return;
        const start = index * stagger;
        gsap.set(modern, { opacity: 1 });
        gsap.set([serif, ornate], { opacity: 0 });
        timeline.fromTo(track, { y: 0, yPercent: 0 }, { y: 0, yPercent: -75, duration: 1, ease: 'sine.inOut', force3D: true }, start)
          .to(modern, { opacity: 0, duration: .32, ease: 'sine.inOut' }, start + .1)
          .to(serif, { opacity: 1, duration: .3, ease: 'sine.inOut' }, start + .1)
          .to(serif, { opacity: 0, duration: .4, ease: 'sine.inOut' }, start + .48)
          .to(ornate, { opacity: 1, duration: .45, ease: 'sine.inOut' }, start + .48);
      });
      return () => intro.querySelectorAll<HTMLElement>('[data-dial-track]').forEach(track => track.style.removeProperty('will-change'));
    }, intro);
    return () => media.revert();
  }, [word, sectionId, staticLetters, lines]);

  return <header ref={root} className="events-intro" data-heading-text={word}>
    <Heading className="events-title" data-events-title style={titleStyle}>
      <span className="sr-only">{word}</span>
      <span className="events-title-lines" aria-hidden="true">
        {rows.map((line, rowIndex) => {
          const fixed = staticLetters ?? Math.floor(line.length / 2);
          return <span className="events-title-word" data-title-line key={rowIndex}>
            <span className="events-title-static">{line.slice(0, fixed).split('').map((letter, index) => <span key={index}>{letter}</span>)}</span>
            {line.slice(fixed).split('').map((letter, index) => /[\s-]/.test(letter)
              ? <span className="events-title-separator" key={index}>{letter}</span>
              : <span className="events-title-dial" data-dial key={index} style={{ width: LETTER_WIDTH[letter] ?? '.8em' }}>
                <span className="events-title-track" data-dial-track>
                  {[0, 1, 2, 3].map(row => <span className="events-title-row" key={row}>
                    <span className="events-title-face events-title-face--modern" data-face="modern">{letter}</span>
                    <span className="events-title-face events-title-face--serif" data-face="serif">{letter}</span>
                    <span className="events-title-face events-title-face--ornate" data-face="ornate">{letter}</span>
                  </span>)}
                </span>
              </span>)}
          </span>;
        })}
      </span>
    </Heading>
    {description && <p className="sr-only">{description}</p>}
  </header>;
}

export default function EventsTitle() {
  return <RollingSectionTitle word="EVENTS" sectionId="events" description="little sparks, limitless dreams" />;
}
