import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BlogTransitionArt from './BlogTransitionArt';
import { RollingSectionTitle } from './EventsTitle';
import CircularTransitionArt from './CircularTransitionArt';
import { TRANSITION_SCRUB } from '../lib/smoothScroll';
import './SectionColorFan.css';

gsap.registerPlugin(ScrollTrigger);

type SectionColorFanProps = {
  children: ReactNode;
  name: string;
  heading: ReactNode;
  headingLines?: readonly string[];
  from?: string;
  surface?: string;
  bands?: readonly [string, string];
  blogArt?: boolean;
  artwork?: boolean;
};

/** The chapter heading rides over the circles; its body follows in normal flow. */
export default function SectionColorFan({
  children, name, heading, headingLines, from = '#fff9e9', surface = '#fff9e9',
  bands = ['#b49880', '#d9bfb8'], blogArt = false, artwork = true,
}: SectionColorFanProps) {
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!element || !stage || !viewport || !content) return;

    const discs = Array.from(viewport.querySelectorAll<HTMLElement>('[data-color-disc]'));
    const headingElement = viewport.querySelector<HTMLElement>('[data-fan-heading]');
    const measure = () => {
      // Cover the farthest viewport corner. Never size a disc to a chapter's
      // content height: long chapters otherwise produce enormous, flat arcs.
      const radius = Math.hypot(viewport.clientWidth / 2, viewport.clientHeight * .55);
      viewport.style.setProperty('--fan-diameter', `${Math.ceil(radius * 2 + 4)}px`);
      if (headingElement) {
        const viewportTop = viewport.getBoundingClientRect().top;
        const headingBounds = headingElement.getBoundingClientRect();
        viewport.style.setProperty('--fan-heading-top', `${headingBounds.top - viewportTop}px`);
        viewport.style.setProperty('--fan-heading-bottom', `${headingBounds.bottom - viewportTop}px`);
      }
      const blogs = content.querySelector<HTMLElement>('#blogs');
      if (blogs) content.style.setProperty('--blog-section-y',
        `${blogs.getBoundingClientRect().top - content.getBoundingClientRect().top}px`);
      const anchorId = name === 'contact' ? 'envelope-footer' : name;
      const anchor = content.querySelector<HTMLElement>(`#${anchorId}`);
      if (anchor) {
        // Existing menu/hash links should land on the relocated heading,
        // halfway through the circle sweep, rather than skip to its body.
        const offset = anchor.getBoundingClientRect().top - stage.getBoundingClientRect().top
          - (stage.offsetHeight - viewport.offsetHeight) * .5;
        element.style.setProperty('--fan-anchor-offset', `${Math.max(0, offset)}px`);
      }
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(viewport);
    resize.observe(content);
    if (headingElement) resize.observe(headingElement);
    ScrollTrigger.addEventListener('refreshInit', measure);

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage, start: 'top top', end: 'bottom bottom',
          scrub: TRANSITION_SCRUB, invalidateOnRefresh: true,
        },
      });
      // Prepare only nearby scenes for compositing before the first circle
      // appears, rather than uploading large layers on its first moving frame.
      const layers = viewport.querySelectorAll<HTMLElement>('[data-color-disc], [data-dial-track], [data-transition-art]');
      ScrollTrigger.create({
        trigger: stage, start: 'top 110%', end: 'bottom -10%',
        onToggle: self => layers.forEach(layer => {
          layer.style.willChange = self.isActive ? 'transform' : 'auto';
        }),
      });
      // Kalso's 0/17/34 starts and 51/68/85 finishes. The last 15% gives
      // the inner surface time to settle before any section content enters.
      discs.forEach((disc, index) => {
        timeline.fromTo(disc, { scale: 0 }, { scale: 1, duration: .51, force3D: true }, index * .17);
      });
      timeline.to({}, { duration: .15 }, .85);

      // A small, scroll-linked drift belongs to the same timeline as the
      // circles. All artwork remains clipped outside the measured title band.
      const artwork = viewport.querySelectorAll<HTMLElement>('[data-transition-art]');
      artwork.forEach((asset, index) => {
        const depth = Number(asset.dataset.depth);
        const tilt = Number(asset.dataset.tilt);
        timeline.fromTo(asset,
          { y: 22 * depth, rotation: tilt - 3, xPercent: -2 },
          { y: -16 * depth, rotation: tilt + 3, xPercent: 2, duration: 1, ease: 'sine.inOut' }, 0)
          .fromTo(asset, { opacity: 0 }, { opacity: 1, duration: .22, ease: 'sine.out' }, .06 + index * .07);
      });
      const trails = viewport.querySelectorAll('[data-transition-trail]');
      if (trails.length) timeline.fromTo(trails,
        { attr: { 'stroke-dashoffset': 1 } },
        { attr: { 'stroke-dashoffset': 0 }, duration: .72, ease: 'sine.inOut' }, .12);

      if (blogArt) content.querySelectorAll<HTMLElement>('[data-blog-art]').forEach(asset => {
        const depth = Number(asset.dataset.depth);
        const tilt = Number(asset.dataset.tilt);
        gsap.fromTo(asset, { y: () => innerHeight * .12 * depth, rotation: tilt - 5 }, {
          y: () => -innerHeight * .2 * depth, rotation: tilt + 5, ease: 'none',
          scrollTrigger: {
            trigger: content, start: 'top bottom', end: 'bottom top',
            scrub: 1.4, invalidateOnRefresh: true,
          },
        });
      });
      return () => layers.forEach(layer => layer.style.removeProperty('will-change'));
    }, element);

    return () => {
      resize.disconnect();
      ScrollTrigger.removeEventListener('refreshInit', measure);
      media.revert();
    };
  }, [blogArt, artwork, name]);

  const palette = {
    '--fan-from': from,
    '--fan-surface': surface,
    '--fan-outer': bands[0],
    '--fan-middle': bands[1],
  } as CSSProperties;

  return <div ref={root} className="section-color-fan" style={palette} data-circle-section={name}>
    <div ref={stageRef} id={`${name}-transition`} className="section-color-fan-stage">
      <div ref={viewportRef} className="section-color-fan-viewport">
        <div className="section-color-fan-anchor" aria-hidden="true">
          <div data-color-disc className="section-color-fan-disc section-color-fan-disc--outer" />
          <div data-color-disc className="section-color-fan-disc section-color-fan-disc--middle" />
          <div data-color-disc className="section-color-fan-disc section-color-fan-disc--inner" />
        </div>
        {artwork && <CircularTransitionArt section={name} trailsOnly />}
        <div className="section-color-fan-heading" data-fan-heading>
          {typeof heading === 'string'
            ? <RollingSectionTitle word={heading} lines={headingLines} sectionId={name} as="h2" />
            : heading}
        </div>
      </div>
    </div>
    <div ref={contentRef} className="section-color-fan-content">
      {blogArt && <div className="section-color-fan-art" aria-hidden="true"><BlogTransitionArt /></div>}
      {children}
    </div>
  </div>;
}
