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

export function floatPostcards(cards: NodeListOf<HTMLElement>, trigger: HTMLElement, compact: boolean) {
  // A longer glide keeps the two depths in motion as the prints cross the viewport.
  const timeline = gsap.timeline({
    defaults: { ease: 'none', force3D: true, duration: 1 },
    scrollTrigger: {
      trigger, start: 'top 112%', end: 'bottom -16%', scrub: .38,
      invalidateOnRefresh: true,
    },
  });
  cards.forEach((card, index) => {
    const { fromY, toY, xDrift, rotationDrift } = postcardMotion(compact, index === 1);
    timeline.fromTo(card, { x: 0, y: () => innerHeight * fromY, rotation: 0 }, {
      x: () => innerWidth * xDrift, y: () => innerHeight * toY, rotation: rotationDrift,
    }, 0);
  });
}
