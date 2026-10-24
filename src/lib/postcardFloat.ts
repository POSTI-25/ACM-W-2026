import gsap from 'gsap';

/** Shared proportions keep archival cards moving at the same depth and tilt. */
export function postcardMotion(compact: boolean, foreground: boolean) {
  const direction = foreground ? 1 : -1;
  return {
    fromY: foreground ? (compact ? .5 : .9) : (compact ? .2 : .35),
    toY: foreground ? (compact ? -.28 : -.42) : (compact ? -.14 : -.24),
    xDrift: direction * (compact ? .004 : .008),
    rotationDrift: direction * 1.5,
  };
}

/** The shared background/foreground drift used by the archival postcards. */
export function floatPostcard(
  card: HTMLElement,
  trigger: HTMLElement,
  options: {
    compact: boolean;
    foreground: boolean;
    centered?: boolean;
    x?: () => number;
    y?: () => number;
    rotation?: number;
  },
) {
  const { compact, foreground, centered = false, rotation = 0 } = options;
  const { fromY, toY, xDrift, rotationDrift } = postcardMotion(compact, foreground);
  const origin = centered ? (fromY + toY) / 2 : 0;
  return gsap.fromTo(card, {
    y: () => (options.y?.() ?? 0) + innerHeight * (fromY - origin),
    x: () => options.x?.() ?? 0,
    rotation,
  }, {
    y: () => (options.y?.() ?? 0) + innerHeight * (toY - origin),
    x: () => (options.x?.() ?? 0) + innerWidth * xDrift,
    rotation: rotation + rotationDrift,
    ease: 'none',
    scrollTrigger: {
      trigger, start: 'top bottom', end: 'bottom top', scrub: 1,
      invalidateOnRefresh: true,
      onToggle: self => { card.style.willChange = self.isActive ? 'transform' : 'auto'; },
    },
  });
}
