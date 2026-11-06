import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

// Page inertia supplies the softness; circles and letters need only a short,
// shared catch-up so they do not continue rolling after the stage has left.
export const TRANSITION_SCRUB = .22;

let scroller: Lenis | null = null;

export function startSmoothScroll() {
  const lenis = new Lenis({
    lerp: .075,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true,
    respectReducedMotion: true,
  });
  scroller = lenis;

  const update = () => ScrollTrigger.update();
  const tick = (seconds: number) => lenis.raf(seconds * 1000);
  lenis.on('scroll', update);
  // Advance native scroll before GSAP renders its animations, using one clock.
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(tick, false, true);

  return () => {
    gsap.ticker.remove(tick);
    lenis.off('scroll', update);
    lenis.destroy();
    if (scroller === lenis) scroller = null;
  };
}

/** Menu jumps use the same inertia owner as wheel scrolling. */
export function scrollToPosition(top: number, duration = 1.25, easing = (t: number) => 1 - (1 - t) ** 3) {
  const destination = Math.max(0, top);
  if (scroller) {
    scroller.scrollTo(destination, {
      duration,
      immediate: duration === 0,
      lerp: 0,
      easing,
    });
    return;
  }
  window.scrollTo({
    top: destination,
    behavior: duration === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}
