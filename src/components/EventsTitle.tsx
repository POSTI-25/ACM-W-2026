import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './EventsTitle.css';

gsap.registerPlugin(ScrollTrigger);
const DIALS = [{ letter: 'N', width: '.74em' }, { letter: 'T', width: '.66em' }, { letter: 'S', width: '.65em' }];

/** Three independent mechanical dials; fixed cells prevent font-induced layout shifts. */
export default function EventsTitle() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const intro = root.current;
    const events = intro?.closest('#events');
    if (!intro || !events) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: events, start: 'top 88%', end: 'top 18%', scrub: 1.15,
          invalidateOnRefresh: true,
          onToggle: self => {
            intro.querySelectorAll<HTMLElement>('[data-dial-track]').forEach(track => {
              track.style.willChange = self.isActive ? 'transform' : 'auto';
            });
          },
        },
      });
      intro.querySelectorAll<HTMLElement>('[data-dial]').forEach((dial, index) => {
        const track = dial.querySelector('[data-dial-track]');
        const modern = dial.querySelectorAll('[data-face="modern"]');
        const serif = dial.querySelectorAll('[data-face="serif"]');
        const ornate = dial.querySelectorAll('[data-face="ornate"]');
        if (!track) return;
        const start = index * .12;
        gsap.set(modern, { opacity: 1 });
        gsap.set([serif, ornate], { opacity: 0 });
        timeline.fromTo(track, { y: 0, yPercent: 0 }, { y: 0, yPercent: -75, duration: 1, ease: 'sine.inOut' }, start)
          .to(modern, { opacity: 0, duration: .32, ease: 'sine.inOut' }, start + .1)
          .to(serif, { opacity: 1, duration: .3, ease: 'sine.inOut' }, start + .1)
          .to(serif, { opacity: 0, duration: .4, ease: 'sine.inOut' }, start + .48)
          .to(ornate, { opacity: 1, duration: .45, ease: 'sine.inOut' }, start + .48);
      });
      return () => intro.querySelectorAll<HTMLElement>('[data-dial-track]').forEach(track => track.style.removeProperty('will-change'));
    }, intro);
    return () => media.revert();
  }, []);

  return <header ref={root} className="events-intro">
    <h1 className="events-title" data-events-title>
      <span className="sr-only">EVENTS</span>
      <span className="events-title-word" aria-hidden="true">
        <span className="events-title-static">EVE</span>
        {DIALS.map(({ letter, width }) => <span className="events-title-dial" data-dial key={letter} style={{ width }}>
          <span className="events-title-track" data-dial-track>
            {[0, 1, 2, 3].map(row => <span className="events-title-row" key={row}>
              <span className="events-title-face events-title-face--modern" data-face="modern">{letter}</span>
              <span className="events-title-face events-title-face--serif" data-face="serif">{letter}</span>
              <span className="events-title-face events-title-face--ornate" data-face="ornate">{letter}</span>
            </span>)}
          </span>
        </span>)}
      </span>
    </h1>
  </header>;
}
