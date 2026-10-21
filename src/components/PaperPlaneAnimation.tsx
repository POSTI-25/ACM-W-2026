import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { AwardFlightController } from './awardFlightScene';

export default function PaperPlaneAnimation() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    const stage = host?.closest<HTMLElement>('[data-award-card]');
    const banner = stage?.querySelector<HTMLElement>('[data-award-banner]');
    if (!host || !stage || !banner) return;
    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, context => {
      const moving = Boolean(context.conditions?.moving);
      let controller: AwardFlightController | null = null;
      let loading = false;
      let live = true;
      let inView = false;
      host.dataset.renderer = 'fallback';
      const float = moving ? gsap.fromTo(banner, { y: -3 }, {
        y: 3, duration: 4.8, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
      }) : null;
      const updatePlayback = () => {
        const active = moving && inView && !document.hidden;
        controller?.setActive(active);
        if (active) float?.play(); else float?.pause();
        banner.style.willChange = active ? 'transform' : 'auto';
      };
      const loadScene = async () => {
        if (!moving || controller || loading) return;
        loading = true;
        try {
          const { createAwardFlight } = await import('./awardFlightScene');
          if (!live) return;
          controller = createAwardFlight(host, stage, banner);
          updatePlayback();
        } catch {
          // Retain a paper-plane illustration if WebGL or the deferred chunk is unavailable.
          host.dataset.renderer = 'fallback';
        }
      };
      const visibility = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        if (inView) void loadScene();
        updatePlayback();
      }, { rootMargin: '160px 0px' });
      visibility.observe(stage);
      document.addEventListener('visibilitychange', updatePlayback);
      return () => {
        live = false;
        visibility.disconnect();
        document.removeEventListener('visibilitychange', updatePlayback);
        controller?.dispose();
        float?.kill();
        banner.style.removeProperty('will-change');
      };
    }, host);
    return () => media.revert();
  }, []);

  return <div ref={root} className="award-flight" data-renderer="fallback" aria-hidden="true">
    <svg className="award-flight-fallback" viewBox="0 0 80 50" focusable="false">
      <path d="M8 7 73 24 13 45 25 26Z" fill="#211c18"/>
      <path d="M8 7 25 26 73 24M25 26 13 45 38 31" fill="none" stroke="#c0a383" strokeWidth="1.3"/>
    </svg>
  </div>;
}
