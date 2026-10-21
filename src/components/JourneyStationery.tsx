import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InkBottleArtwork from './InkBottleArtwork';
import { INK_FLOW_FULL, INK_FLOW_REST } from './inkFlow';

gsap.registerPlugin(ScrollTrigger);

/** Ink placement, scroll travel, ambient float and liquid own separate transforms. */
export default function JourneyStationery() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = root.current;
    const track = stage?.querySelector<HTMLElement>('[data-stationery-scroll]');
    const float = stage?.querySelector<HTMLElement>('[data-stationery-float]');
    if (!stage || !track || !float) return;
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', compact: '(max-width: 48rem)' }, context => {
      if (!context.conditions?.motion) return;
      const compact = Boolean(context.conditions.compact);
      const select = gsap.utils.selector(stage);
      // Measure the untransformed stage so refreshes never accumulate travel.
      const outsideMargin = () => -(stage.offsetLeft + stage.offsetWidth + 32);
      const travel = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 1.35,
          invalidateOnRefresh: true,
          onToggle: self => { track.style.willChange = self.isActive ? 'transform' : 'auto'; },
        },
      });
      travel.fromTo(track, { x: outsideMargin }, { x: 0, duration: .58, ease: 'sine.inOut' }, 0)
        .fromTo(track, { y: compact ? 40 : 76, rotation: 5 }, {
          y: compact ? -8 : -32, rotation: -2, duration: 1, ease: 'none',
        }, 0);

      const floatLoop = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } })
        .to(float, { x: -2, y: -5, rotation: -.5, duration: 4.2 })
        .to(float, { x: 2, y: 3, rotation: .4, duration: 4.4 })
        .to(float, { x: 0, y: 0, rotation: 0, duration: 3.6 });
      const loops: gsap.core.Animation[] = [floatLoop];
      loops.push(gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } })
        .to(select('[data-ink-stream]'), { attr: { d: INK_FLOW_FULL }, duration: 2.2 })
        .to(select('[data-ink-stream]'), { attr: { d: INK_FLOW_REST }, duration: 2.6 }));
      loops.push(gsap.timeline({ paused: true, repeat: -1, repeatDelay: .7 })
        .fromTo(select('[data-ink-drop]'), { x: 0, y: 0, opacity: 0 }, { opacity: .85, duration: .25 })
        .to(select('[data-ink-drop]'), { x: -12, y: 17, duration: .85, ease: 'power1.in' }, 0)
        .to(select('[data-ink-drop]'), { opacity: 0, duration: .3 }, .55));
      loops.push(gsap.fromTo(select('[data-ink-current]'), { attr: { 'stroke-dashoffset': 0 } }, {
        attr: { 'stroke-dashoffset': -16 }, duration: 1.8, repeat: -1, ease: 'none', paused: true,
      }));
      stage.querySelectorAll<SVGEllipseElement>('[data-ink-ripple]').forEach((ripple, index) => {
        const rippleLoop = gsap.timeline({ paused: true, repeat: -1 })
          .fromTo(ripple, { scaleX: .35, scaleY: .6, opacity: 0, svgOrigin: '137 188' },
            { scaleX: 1.6, scaleY: 1.25, duration: 3.2, ease: 'sine.out' })
          .to(ripple, { opacity: .9, duration: .6 }, 0)
          .to(ripple, { opacity: 0, duration: 1.6 }, 1.6);
        rippleLoop.progress(index * .5).pause();
        loops.push(rippleLoop);
      });

      let inView = false;
      const syncActivity = () => {
        const active = inView && !document.hidden;
        loops.forEach(loop => { if (active) loop.play(); else loop.pause(); });
        float.style.willChange = active ? 'transform' : 'auto';
      };
      // Observe final layout, not animated bounds: no entry/bobbing feedback loop.
      const observer = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        syncActivity();
      }, { rootMargin: '80px 0px' });
      observer.observe(stage);
      document.addEventListener('visibilitychange', syncActivity);
      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', syncActivity);
        track.style.removeProperty('will-change');
        float.style.removeProperty('will-change');
      };
    }, stage);
    return () => media.revert();
  }, []);

  return <div ref={root} className="journey-asset journey-asset--ink" data-stationery="ink">
    <div className="stationery-scroll" data-stationery-scroll>
      <div className="stationery-float" data-stationery-float>
        <div className="stationery-artwork">
          <InkBottleArtwork/>
        </div>
      </div>
    </div>
  </div>;
}
