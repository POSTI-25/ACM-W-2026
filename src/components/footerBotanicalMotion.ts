import gsap from 'gsap';

/** An independent, real-time drift ending at the sprig's original CSS placement. */
export function createFooterBotanicalMotion(
  botanical: Element | null,
  ratio: number,
  viewportHeight: number,
  reducedMotion: boolean,
) {
  const tl = gsap.timeline({ paused: true });
  if (!botanical) return tl;

  if (reducedMotion) {
    return tl.set(botanical, { autoAlpha: 1, x: 0, y: 0, rotation: 16, scale: 1 });
  }

  const r = ratio;
  const panel = botanical.closest('.scroll-section__pin-container');
  const travel = Math.max(viewportHeight * .55,
    botanical.getBoundingClientRect().bottom - (panel?.getBoundingClientRect().top ?? 0) + 48);
  // Reveal beyond the top edge so the sprig enters by moving into view.
  tl.set(botanical, {
    autoAlpha: 1,
    x: 150 * r,
    y: -travel,
    rotation: -24,
    scale: .88,
    filter: 'drop-shadow(8px 22px 12px #39261712)',
  });
  // Alternating banks narrow as the sprig loses height. The final approach
  // slows into contact without a bounce or a change to its resting anchor.
  tl.to(botanical, {
    keyframes: [
      { x: 75 * r, y: -travel * .72, rotation: -4, scale: .96, duration: 1.15, ease: 'sine.out' },
      { x: -55 * r, y: -travel * .51, rotation: 32, duration: 1.1 },
      { x: 45 * r, y: -travel * .33, rotation: 2, scale: 1, duration: 1.05 },
      { x: -22 * r, y: -travel * .17, rotation: 25, duration: 1 },
      { x: 8 * r, y: -travel * .05, rotation: 12, duration: 1.1 },
      { x: 0, y: 0, rotation: 16, scale: 1, duration: 1.55, ease: 'power2.out' },
    ],
    ease: 'none',
    defaults: { ease: 'sine.inOut' },
  }, 0);
  tl.to(botanical, {
    filter: 'drop-shadow(1px 3px 2px #39261724)',
    duration: 2.65,
    ease: 'sine.out',
  }, 4.3);
  return tl;
}
