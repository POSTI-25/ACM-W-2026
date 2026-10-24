import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ChapterJourney.css';
import BlogTransitionArt from './BlogTransitionArt';

gsap.registerPlugin(ScrollTrigger);

/** The same three parchment surfaces used to introduce Events. */
export default function SectionColorFan({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    const section = element?.querySelector<HTMLElement>('#blogs');
    if (!element || !section) return;
    const measure = () => {
      const y = section.offsetTop + innerHeight * .24;
      const radius = Math.hypot(element.clientWidth / 2, Math.max(y, element.offsetHeight - y));
      element.style.setProperty('--journey-portal-y', `${y}px`);
      element.style.setProperty('--blog-section-y', `${section.offsetTop}px`);
      // A slightly tighter sweep than Events, keeping its original colors.
      element.style.setProperty('--journey-diameter', `${Math.ceil((radius * 2 + 80) * .92)}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top -85%',
          scrub: 1.6, invalidateOnRefresh: true },
      });
      ['tan', 'rose', 'cream'].forEach((color, index) => {
        timeline.fromTo(element.querySelector(`.journey-color-disc--${color}`),
          { scale: .018 }, { scale: 1, duration: 1 }, index * .22);
      });
      element.querySelectorAll<HTMLElement>('[data-blog-art]').forEach(asset => {
        const depth = Number(asset.dataset.depth);
        const tilt = Number(asset.dataset.tilt);
        gsap.fromTo(asset, { y: () => innerHeight * .12 * depth, rotation: tilt - 5 }, {
          y: () => -innerHeight * .2 * depth, rotation: tilt + 5, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top',
            scrub: 1.4, invalidateOnRefresh: true },
        });
      });
    }, element);
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      resize.disconnect();
      window.removeEventListener('resize', measure);
      media.revert();
    };
  }, []);

  return <div ref={root} className="section-color-fan">
    <div className="section-color-fan-backdrop" aria-hidden="true">
      <div className="journey-color-anchor">
        <div className="journey-color-disc journey-color-disc--tan" />
        <div className="journey-color-disc journey-color-disc--rose" />
        <div className="journey-color-disc journey-color-disc--cream" />
      </div>
      <BlogTransitionArt />
    </div>
    {children}
  </div>;
}
