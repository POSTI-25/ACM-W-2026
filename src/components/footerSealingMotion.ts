import gsap from 'gsap';
import type { FooterStampHandle, FooterStampPose } from './FooterSealStamp';

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
  stampModel: FooterStampHandle | null;
};

/** Scroll-scrubbed sealing. The paper is XY; the press travels along its Z normal. */
export function createFooterSealingMotion({
  stamp, pool, drops, seal, envelope, ratio: r,
  viewportWidth, envelopeWidth, reducedMotion, stampModel,
}: SealingElements) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } });
  const pose: FooterStampPose = { pitch: .24, yaw: -.28, roll: -.1, lift: 1.5, paperTilt: 0 };
  const renderPose = () => stampModel?.setPose(pose);
  renderPose();
  // Tool motion is in viewport pixels; its anchor follows the projected wax.
  const offscreen = viewportWidth / 2 + envelopeWidth * .35;
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
    xPercent: -50, yPercent: -50,
    x: -offscreen, y: -105 * r, rotation: -24,
    opacity: 0, visibility: 'hidden', transformOrigin: '50% 50%',
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
  tl.to(pose, { pitch: .35, yaw: .2, roll: 0, duration: 3.6, onUpdate: renderPose }, 'entrance');
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
  tl.to(stamp, { x: 0, y: 0, rotation: 0, duration: .85 }, 'align');
  tl.to(envelope, { rotationX: 30, duration: .85 }, 'align');
  // Turn about the die centre. PI/2 makes the handle exactly perpendicular
  // to the envelope and leaves the brass face parallel to the wax.
  tl.to(pose, { pitch: Math.PI / 2, yaw: 0, roll: 0, paperTilt: Math.PI / 6, duration: .85, onUpdate: renderPose }, 'align');
  // Once aligned, press only into the paper; no sideways slide or screen-Y drop.
  tl.to(pose, { lift: 0, duration: .55, ease: 'power1.inOut', onUpdate: renderPose }, 'press');

  tl.to(pool, { scaleX: 1.12, scaleY: .94, borderRadius: '43% 57% 46% 54%', duration: .22 }, 'impact');
  tl.to(pool, { scaleX: 1.07, scaleY: 1.03, borderRadius: '49% 51% 47% 53%', duration: .45 }, 5.22);
  // A restrained impact on the assembly, always returning to its original y.
  tl.to(envelope, { y: .8 * r, duration: .08, ease: 'sine.inOut' }, 'impact');
  tl.to(envelope, { y: -.35 * r, duration: .1, ease: 'sine.inOut' }, 5.08);
  tl.to(envelope, { y: 0, duration: .12, ease: 'sine.out' }, 5.18);

  // The embossed artwork is revealed under the foot while it is pressed.
  tl.to(seal, { opacity: 1, scale: 1, duration: .28 }, 5.33);
  // Hold the normal alignment through contact and the initial clearance lift.
  tl.to(pose, { lift: 1.5, duration: 1, ease: 'sine.inOut', onUpdate: renderPose }, 'lift');
  tl.to(pose, { pitch: .35, yaw: -.4, roll: .12, duration: .9, onUpdate: renderPose }, 'lift+=.65');
  tl.to(stamp, {
    x: offscreen, y: -240 * r, rotation: 14, opacity: 0,
    duration: 1.55, ease: 'sine.inOut',
  }, 'exit');
  tl.set(stamp, { visibility: 'hidden' }, 8.2);
  tl.to(envelope, { rotationX: 0, duration: .7 }, 8.2);
  tl.to(pose, { paperTilt: 0, duration: .7, onUpdate: renderPose }, 8.2);

  return tl;
}
