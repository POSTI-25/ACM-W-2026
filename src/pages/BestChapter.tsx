import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import AwardEngraving from '../components/AwardEngraving';
import AwardChapterMark from '../components/AwardChapterMark';
import { createAwardEngraving } from '../components/awardEngravingMotion';
import quill from '../assets/decor/black-feather.svg';
import parchment from '../assets/award/aged-parchment.webp';
import parchmentRoll from '../assets/award/parchment-roll.webp';
import './BestChapter.css';

export default function BestChapter() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    let live = true, started = false;
    let reveal: gsap.core.Timeline;
    const context = gsap.context(() => {
      const logo = banner.querySelector('.award-chapter-mark');
      const credit = banner.querySelector('.award-credit');
      // Zero velocity and acceleration at both ends avoids a mechanical stop.
      const travel = (time: number) => time ** 3 * (time * (6 * time - 15) + 10);
      // Remaining paper determines the cylinder's radius. As it thins, its
      // surface turns further for the same length of paper released.
      const radius = (time: number) => Math.sqrt(1 - .7975 * travel(time));
      gsap.set(banner, { '--paper-progress': 0, '--roll-radius': 1,
        '--roll-turn': '0px', '--curl-shade': .3 });
      gsap.set(logo, { opacity: 0, y: 3, scale: .97, transformOrigin: '50% 50%' });
      gsap.set(credit, { opacity: 0 });
      banner.dataset.unroll = 'ready';
      reveal = gsap.timeline({ paused: true,
        onStart: () => { banner.dataset.unroll = 'unrolling'; },
        onComplete: () => { banner.dataset.unroll = 'open'; },
      })
        .to(banner, { '--paper-progress': 1, duration: 3.8, ease: travel }, 0)
        .to(banner, { '--roll-radius': .45, duration: 3.8,
          ease: time => (1 - radius(time)) / .55 }, 0)
        .to(banner, { '--roll-turn': '-680px', duration: 3.8,
          ease: time => (1 - radius(time)) / .55 }, 0)
        .to(banner, { '--curl-shade': .12, duration: 3.8, ease: travel }, 0)
        .addLabel('settled', 4.05)
        .to(logo, { opacity: 1, y: 0, scale: 1, duration: .65,
          ease: 'sine.out', onStart: () => { banner.dataset.unroll = 'logo'; } }, 'settled')
        .add(createAwardEngraving(banner), 'settled+=.75')
        .to(credit, { opacity: 1, duration: .7, ease: 'sine.inOut' }, '-=.15');
    }, banner);
    // Decode the paper and roll together before either starts moving.
    const feather = new Image();
    feather.src = quill;
    const ready = Promise.allSettled([
      ...Array.from(banner.querySelectorAll('img')).map(image => image.decode()),
      feather.decode(),
      document.fonts.load('400 1rem "Award Hand"'),
    ]);
    const observer = new IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      // One real-time reveal. Scrolling never controls its progress or speed.
      void ready.then(() => { if (live && !motion.matches) reveal.play(); });
    }, { threshold: .18 });
    observer.observe(banner);
    const onMotionChange = () => {
      if (motion.matches) { started = true; observer.disconnect(); reveal.progress(1).pause(); }
    };
    motion.addEventListener('change', onMotionChange);
    return () => {
      live = false;
      observer.disconnect();
      motion.removeEventListener('change', onMotionChange);
      context.revert();
      banner.querySelector('[data-award-quill]')?.removeAttribute('transform');
      banner.querySelector('[data-award-quill]')?.removeAttribute('style');
      delete banner.dataset.unroll;
    };
  }, []);

  return (
    <div data-award-card className="award-scene">
      <div ref={bannerRef} data-award-banner className="award-banner">
        <div className="award-sheet">
          <img className="award-parchment-stock" src={parchment} alt="" width={1536} height={1024} decoding="async" />
          <AwardChapterMark />
          <div className="award-inscription">
            <AwardEngraving />
            <div className="award-credit"><span aria-hidden="true" /><p>By ACM India</p><span aria-hidden="true" /></div>
          </div>
        </div>
        <div className="award-roll" aria-hidden="true">
          <img className="award-roll-stock" src={parchmentRoll} alt="" width={2172} height={724} decoding="async" />
          <div className="award-roll-turn" />
        </div>
      </div>
    </div>
  );
}
