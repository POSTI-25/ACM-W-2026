import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import PaperPlaneAnimation from '../components/PaperPlaneAnimation';
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
    let reveal: gsap.core.Tween;
    const context = gsap.context(() => {
      gsap.set(banner, { '--paper-progress': 0 });
      banner.dataset.unroll = 'ready';
      reveal = gsap.to(banner, {
        '--paper-progress': 1, duration: 4.4, ease: 'sine.inOut', paused: true,
        onStart: () => { banner.dataset.unroll = 'unrolling'; },
        onComplete: () => { banner.dataset.unroll = 'open'; },
      });
    }, banner);
    // Decode the paper and roll together before either starts moving.
    const ready = Promise.allSettled([
      ...Array.from(banner.querySelectorAll('img')).map(image => image.decode()),
      document.fonts.load('700 1rem "Award Gothic"'),
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
      delete banner.dataset.unroll;
    };
  }, []);

  return (
    <div data-award-card className="award-scene">
      <div ref={bannerRef} data-award-banner className="award-banner">
        <div className="award-sheet">
          <img className="award-parchment-stock" src={parchment} alt="" width={1536} height={1024} decoding="async" />
          <div className="award-inscription">
            <span className="award-flourish" aria-hidden="true">&#10022;</span>
            <h2>Best Emerging<br />Chapter</h2>
            <div className="award-credit"><span aria-hidden="true" /><p>By ACM India</p><span aria-hidden="true" /></div>
          </div>
        </div>
        <div className="award-roll" aria-hidden="true">
          <img className="award-roll-stock" src={parchmentRoll} alt="" width={2172} height={724} decoding="async" />
          <div className="award-roll-turn" />
        </div>
      </div>
      <PaperPlaneAnimation />
    </div>
  );
}
