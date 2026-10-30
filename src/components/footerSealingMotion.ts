import gsap from 'gsap';

type SealingElements = {
  stamp: HTMLDivElement;
  pool: HTMLDivElement;
  drops: HTMLElement[];
  seal: HTMLImageElement;
  envelope: HTMLDivElement;
  ratio: number;
  viewportWidth: number;
  envelopeWidth: number;
  reducedMotion: boolean;
};

/** Real-time sealing choreography, composed into the automatic footer finish. */
export function createFooterSealingMotion({
  stamp, pool, drops, seal, envelope, ratio: r,
  viewportWidth, envelopeWidth, reducedMotion,
}: SealingElements) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } });
  // The outside flap's existing .8 scale is the only coordinate conversion.
  const offscreen = (viewportWidth / 2 + envelopeWidth * .35) / .8;
  // Resolve this when each drop starts, after the flap is closed and sticky.
  // Convert the top screen edge into the wax surface's local coordinates;
  // a fixed envelope-relative offset used to make drops appear mid-screen.
  const dropStartY = () => {
    const surface = pool.parentElement!;
    const bounds = surface.getBoundingClientRect();
    const pin = envelope.closest('.scroll-section__pin-container')!;
    const surfaceScale = bounds.width / surface.offsetWidth || .8;
    // Refresh can temporarily measure with the page scrolled to its top.
    // The landing point relative to the sticky panel remains invariant.
    const landingY = bounds.top - pin.getBoundingClientRect().top + bounds.height / 2;
    return -(landingY + 24) / surfaceScale;
  };

  gsap.set(seal, { opacity: 0, scale: .96 });
  gsap.set(pool, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(drops, { opacity: 0, xPercent: -50, yPercent: -50 });
  gsap.set(stamp, {
    xPercent: -50, yPercent: -100,
    x: -offscreen, y: -105 * r, rotation: -24,
    opacity: 0, visibility: 'hidden', transformOrigin: '50% 100%',
  });

  if (reducedMotion) {
    tl.set(seal, { opacity: 1, scale: 1 }, 0);
    return tl;
  }

  tl.addLabel('entrance', 0)
    .addLabel('wax', .65)
    .addLabel('align', 3.6)
    .addLabel('press', 4.45)
    .addLabel('impact', 5)
    .addLabel('lift', 5.65)
    .addLabel('exit', 6.65);

  tl.set(stamp, { visibility: 'visible' }, 'entrance');
  tl.to(stamp, {
    x: -105 * r, y: -105 * r, rotation: -14, opacity: 1,
    duration: 1.4, ease: 'sine.inOut',
  }, 'entrance');
  // A shallow continuous hover while the wax forms, owned by this timeline.
  tl.to(stamp, { y: -113 * r, rotation: -12, duration: 1.1 }, 1.4);
  tl.to(stamp, { y: -105 * r, rotation: -14, duration: 1.1 }, 2.5);

  const radii = [
    '58% 42% 52% 48% / 44% 56% 48% 52%',
    '44% 56% 43% 57% / 60% 44% 56% 40%',
    '54% 46% 58% 42% / 43% 61% 39% 57%',
    '44% 56% 61% 39% / 53% 41% 59% 47%',
  ];
  drops.forEach((drop, index) => {
    const start = .65 + index * .55;
    const hit = start + .85;
    tl.set(drop, { x: 0, y: dropStartY, opacity: 1, scaleX: .95, scaleY: 1.08 }, start);
    tl.to(drop, { y: 0, scaleX: .82, scaleY: 1.22, duration: .85, ease: 'power1.in' }, start);
    tl.to(drop, { opacity: 0, scaleX: 1.5, scaleY: .25, duration: .2 }, hit);
    tl.to(pool, {
      opacity: 1, scale: [.46, .68, .86, 1][index],
      borderRadius: radii[index], duration: .42, ease: 'sine.out',
    }, hit);
  });

  tl.to(pool, { borderRadius: '45% 55% 49% 51% / 55% 43% 57% 45%', duration: .45 }, 3.15);
  tl.to(stamp, { x: 0, y: -95 * r, rotation: 0, duration: .85 }, 'align');
  // The contact ellipse sits slightly above the image's bottom edge.
  tl.to(stamp, { y: 12 * r, duration: .55, ease: 'power1.inOut' }, 'press');

  tl.to(pool, { scaleX: 1.12, scaleY: .94, borderRadius: '43% 57% 46% 54%', duration: .22 }, 'impact');
  tl.to(pool, { scaleX: 1.07, scaleY: 1.03, borderRadius: '49% 51% 47% 53%', duration: .45 }, 5.22);
  // A restrained impact on the assembly, always returning to its original y.
  tl.to(envelope, { y: .8 * r, duration: .08, ease: 'sine.inOut' }, 'impact');
  tl.to(envelope, { y: -.35 * r, duration: .1, ease: 'sine.inOut' }, 5.08);
  tl.to(envelope, { y: 0, duration: .12, ease: 'sine.out' }, 5.18);

  // The embossed artwork is revealed under the foot while it is pressed.
  tl.to(seal, { opacity: 1, scale: 1, duration: .28 }, 5.33);
  // A longer press and measured lift let the impression read clearly.
  tl.to(stamp, { y: -130 * r, duration: 1, ease: 'sine.inOut' }, 'lift');
  tl.to(stamp, {
    x: offscreen, y: -240 * r, rotation: 14, opacity: 0,
    duration: 1.55, ease: 'sine.inOut',
  }, 'exit');
  tl.set(stamp, { visibility: 'hidden' }, 8.2);

  return tl;
}
