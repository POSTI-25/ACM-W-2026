import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import NavbarEnvelope from './components/NavbarEnvelope';

// Keep the existing navigation stamps.
import contributorsImg from './assets/contributors.svg';
import aboutAcmwImg from './assets/aboutacmw.svg';
import aboutAcmImg from './assets/abtacm.svg';
import blogsImg from './assets/blogs.svg';
import womenInStemImg from './assets/womeninstem.svg';
import teamImg from './assets/team.svg';

const cards = [
  { id: 1, img: contributorsImg, alt: 'Contributors stamp', link: '#contributors' },
  { id: 2, img: aboutAcmwImg, alt: 'About ACM-W stamp', link: '#about' },
  { id: 3, img: aboutAcmImg, alt: 'About ACM stamp', link: '#about-acm' },
  { id: 4, img: blogsImg, alt: 'Blogs stamp', link: '#blogs' },
  { id: 5, img: womenInStemImg, alt: 'Women in STEM stamp', link: '#title-card-section' },
  { id: 6, img: teamImg, alt: 'Team stamp', link: '#team' },
];

export default function EnvelopeMenu() {
  const containerRef = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasCardsOut, setHasCardsOut] = useState(false);
  const isOpen = hovered || pinned || focused;

  useLayoutEffect(() => {
    let context: gsap.Context | undefined;
    let frame = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const layoutFan = () => {
      const progress = tl.current?.progress() ?? 0;
      const reversed = tl.current?.reversed() ?? false;
      const paused = tl.current?.paused() ?? true;
      context?.revert();

      context = gsap.context(() => {
        const shell = containerRef.current!;
        const shellBounds = shell.getBoundingClientRect();
        const trigger = shell.querySelector('button')!.getBoundingClientRect();
        const stamps = gsap.utils.toArray<HTMLElement>('.nav-card', shell);
        const width = stamps[0].offsetWidth;
        const height = stamps[0].offsetHeight;
        const originX = trigger.left - shellBounds.left + trigger.width / 2;
        const originY = trigger.top - shellBounds.top + trigger.height / 2;
        // A local fan beside the trigger, independent of the page's height.
        const fanTop = trigger.bottom - shellBounds.top + 16 + height / 2;
        const availableRadius = (window.innerHeight - shellBounds.top - fanTop - height / 2 - 24) / 2;
        const radiusY = Math.min(132, Math.max(80, availableRadius));
        const radiusX = radiusY * 1.6;
        const centerY = fanTop + radiusY;
        const deckX = originX + width * 0.62;
        const deckY = fanTop + height * 0.08;
        const shuffle = [-3, 6, -7, 4, -5, 2];
        const timeline = gsap.timeline({
          paused: true,
          onStart: () => setHasCardsOut(true),
          onReverseComplete: () => setHasCardsOut(false),
        });

        stamps.forEach((stamp, index) => {
          const angle = -Math.PI / 2 + index * Math.PI / (stamps.length - 1);
          const centerX = width / 2 + Math.cos(angle) * radiusX;
          const centerStampY = centerY + Math.sin(angle) * radiusY;
          const rotation = -5 + index * 2;
          // All cards emerge together; only the top card is dealt at each beat.
          const extract = motion.matches ? 0 : 0.22 + index * 0.012;
          const deal = motion.matches ? 0 : 0.82 + index * 0.18;
          const duration = motion.matches ? 0.001 : 0.52;
          gsap.set(stamp, {
            left: centerX - width / 2,
            top: centerStampY - height / 2,
            x: originX - centerX,
            y: originY - centerStampY,
            scale: 0.22, rotation: shuffle[index], autoAlpha: 0,
            zIndex: stamps.length - index,
          });
          // A compact shuffled deck clears the pocket and pauses before dealing.
          // Reversing this same timeline collects the deck before tucking it away.
          timeline
            .to(stamp, {
              autoAlpha: 1,
              duration: motion.matches ? 0.001 : 0.08,
              ease: 'none',
            }, extract)
            .to(stamp, {
              x: deckX + index * 2 - centerX,
              y: deckY + index * 2 - centerStampY,
              scale: 0.78,
              rotation: shuffle[index],
              duration: motion.matches ? 0.001 : 0.36,
              ease: 'power2.out',
            }, extract)
            .to(stamp, {
              x: 0, scale: 1, rotation,
              duration,
              ease: 'power3.out',
            }, deal)
            .to(stamp, {
              y: 0,
              duration,
              ease: 'sine.inOut',
            }, deal);

        });
        tl.current = timeline;
      }, containerRef);
      tl.current?.progress(progress).reversed(reversed).paused(paused);
    };

    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layoutFan);
    };
    layoutFan();
    window.addEventListener('resize', onResize);
    motion.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      motion.removeEventListener('change', onResize);
      cancelAnimationFrame(frame);
      context?.revert();
      tl.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (isOpen) tl.current?.timeScale(1).play();
    else tl.current?.timeScale(1.35).reverse();
  }, [isOpen]);

  const close = () => {
    setHovered(false);
    setPinned(false);
    setFocused(false);
  };

  return (
    <nav
      ref={containerRef}
      className={`desktop-envelope-menu-shell ${isOpen ? 'is-open' : ''}`}
      aria-label="Main navigation"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          close();
          containerRef.current?.querySelector('button')?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="desktop-envelope-links"
        aria-label={isOpen ? 'Close envelope menu' : 'Open envelope menu'}
        className="desktop-envelope-toggle"
        onClick={() => {
          if (pinned) close();
          else setPinned(true);
        }}
      >
        <NavbarEnvelope isOpen={isOpen || hasCardsOut} />
      </button>
      <div id="desktop-envelope-links" className="desktop-envelope-links" inert={!isOpen}>
        {cards.map((card) => (
          <a
            key={card.id}
            href={card.link}
            className="nav-card desktop-envelope-nav-card"
            onFocus={() => setFocused(true)}
            onClick={(event) => {
              const target = document.querySelector(card.link);
              if (target) {
                event.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top, behavior: 'smooth' });
              }
              close();
            }}
          >
            <img src={card.img} alt={card.alt} draggable={false} />
          </a>
        ))}
      </div>
    </nav>
  );
}
