import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import featherSilhouette from '../assets/decor/black-feather.svg';
import InkBottleArtwork from './InkBottleArtwork';
import { INK_FLOW_FULL, INK_FLOW_REST } from './inkFlow';

gsap.registerPlugin(ScrollTrigger);

type StationeryKind = 'quill' | 'ink';

/** Placement, scroll travel, ambient float and liquid each own their transforms. */
export default function JourneyStationery({ kind }: { kind: StationeryKind }) {
  const root = useRef<HTMLDivElement>(null);
  const feather = kind === 'quill';

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
      const outsideMargin = () => feather
        ? (stage.offsetParent?.clientWidth ?? innerWidth) - stage.offsetLeft + 32
        : -(stage.offsetLeft + stage.offsetWidth + 32);
      const travel = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 1.35,
          invalidateOnRefresh: true,
          onToggle: self => { track.style.willChange = self.isActive ? 'transform' : 'auto'; },
        },
      });
      travel.fromTo(track, { x: outsideMargin }, { x: 0, duration: .58, ease: 'sine.inOut' }, 0)
        .fromTo(track, { y: compact ? 40 : 76, rotation: feather ? -8 : 5 }, {
          y: compact ? -8 : -32, rotation: feather ? 2 : -2, duration: 1, ease: 'none',
        }, 0);

      const floatLoop = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } })
        .to(float, { x: feather ? 3 : -2, y: -5, rotation: feather ? .8 : -.5, duration: feather ? 3.8 : 4.2 })
        .to(float, { x: feather ? -2 : 2, y: 3, rotation: feather ? -.6 : .4, duration: 4.4 })
        .to(float, { x: 0, y: 0, rotation: 0, duration: 3.6 });
      const loops: gsap.core.Animation[] = [floatLoop];
      if (!feather) {
        loops.push(gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } })
          .to(select('[data-ink-stream]'), { attr: { d: INK_FLOW_FULL }, duration: 2.2 })
          .to(select('[data-ink-stream]'), { attr: { d: INK_FLOW_REST }, duration: 2.6 }));
        loops.push(gsap.timeline({ paused: true, repeat: -1, repeatDelay: .7 })
          .fromTo(select('[data-ink-drop]'), { x: 0, y: 0, opacity: 0 }, { opacity: .85, duration: .25 })
          .to(select('[data-ink-drop]'), { x: -12, y: 17, duration: .85, ease: 'power1.in' }, 0)
          .to(select('[data-ink-drop]'), { opacity: 0, duration: .3 }, .55));
        loops.push(gsap.timeline({ paused: true, repeat: -1, repeatDelay: .4 })
          .fromTo(select('[data-ink-ripple]'), { scaleX: .45, scaleY: .55, opacity: 0, svgOrigin: '137 188' },
            { scaleX: 1.3, scaleY: 1.1, duration: 2.8, ease: 'sine.out' })
          .to(select('[data-ink-ripple]'), { opacity: .65, duration: .55 }, 0)
          .to(select('[data-ink-ripple]'), { opacity: 0, duration: 1.4 }, 1.4));
      }

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
  }, [feather]);

  return <div ref={root} className={`journey-asset journey-asset--${kind}`} data-stationery={kind}>
    <div className="stationery-scroll" data-stationery-scroll>
      <div className="stationery-float" data-stationery-float>
        <div className="stationery-artwork">
          {feather ? <img src={featherSilhouette} alt="" width={320} height={560}
            decoding="async" draggable={false}/> : <InkBottleArtwork/>}
        </div>
      </div>
    </div>
  </div>;
}
