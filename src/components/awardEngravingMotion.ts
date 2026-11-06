import gsap from 'gsap';
import artwork from '../assets/award/award-engraving.json';

/** One continuous pen performance, with the ink blooming behind each swish. */
export function createAwardEngraving(banner: HTMLElement) {
  const pen = banner.querySelector<SVGGElement>('[data-award-quill]')!;
  const gestures = [...banner.querySelectorAll<SVGPathElement>('[data-award-gesture]')];
  const glyphs = banner.querySelectorAll<SVGPathElement>('[data-award-glyph]');
  const masks = banner.querySelectorAll<SVGGElement>('[data-award-glyph-reveal]');
  masks.forEach(mask => gsap.set(mask.querySelectorAll('circle'), { attr: { r: 0 } }));
  gsap.set(glyphs, { fill: '#aa8757', opacity: .12 });
  gsap.set(gestures, { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 });

  const poseAt = (gesture: SVGPathElement, progress: number) => {
    const length = gesture.getTotalLength();
    const distance = progress * length;
    const point = gesture.getPointAtLength(distance);
    const before = gesture.getPointAtLength(Math.max(0, distance-10));
    const after = gesture.getPointAtLength(Math.min(length, distance+10));
    const dx = after.x-before.x, dy = after.y-before.y;
    const tangentLength = Math.hypot(dx, dy) || 1;
    // Bank gently with the tangent vector: unlike atan2, this cannot snap at +/-180 degrees.
    return { x: point.x, y: point.y, tilt: -23+16*dy/tangentLength+5*(1-dx/tangentLength) };
  };
  const penState = { ...poseAt(gestures[0], 0), opacity: 0 };
  const renderPen = () => {
    pen.setAttribute('transform', `translate(${penState.x} ${penState.y}) rotate(${penState.tilt})`);
    pen.style.opacity = String(penState.opacity);
  };
  const timeline = gsap.timeline();
  timeline.to(penState, { opacity: .94, duration: .2, onUpdate: renderPen }, 0);

  gestures.forEach((gesture, line) => {
    const start = .12+line*3.45;
    const flickEnd = start+2.35;
    const motion = { progress: 0 };
    const trace = () => {
      Object.assign(penState, poseAt(gesture, motion.progress));
      renderPen();
      gesture.setAttribute('stroke-dashoffset', String(1-motion.progress));
    };
    timeline.to(motion, { progress: .88, duration: 2.05, ease: 'sine.inOut', onUpdate: trace }, start)
      .to(motion, { progress: 1, duration: .3, ease: 'power2.in', onUpdate: trace }, start+2.05)
      .to(gesture, { opacity: .12, duration: .3 }, start+.15)
      .to(gesture, { opacity: 0, duration: .6 }, flickEnd);

    const lineGlyphs = artwork.glyphs.map((glyph, index) => ({ ...glyph, index })).filter(glyph => glyph.line === line);
    lineGlyphs.forEach(({ bounds: [, , width, height], index }, position) => {
      const at = start+.55+position*.095;
      const ink = { progress: 0 };
      const circles = masks[index].querySelectorAll('circle');
      timeline.to(ink, { progress: 1, duration: 1.2, ease: 'sine.inOut', onUpdate: () => {
        circles.forEach((circle, seed) => {
          const bloom = gsap.utils.clamp(0, 1, (ink.progress-seed*.1)/(1-seed*.1));
          circle.setAttribute('r', String(Math.hypot(width,height)*1.4*bloom*bloom));
        });
      } }, at)
        .to(glyphs[index], { fill: '#4f2416', opacity: 1, duration: 1.35, ease: 'sine.inOut' }, at+.08);
    });

    const next = gestures[line+1];
    if (next) {
      const from = poseAt(gesture, 1), to = poseAt(next, 0);
      const turn = { progress: 0 };
      timeline.to(turn, { progress: 1, duration: 1.1, ease: 'sine.inOut', onUpdate: () => {
          const t = turn.progress, u = 1-t;
          // A lifted return arc connects the gestures without hiding or teleporting the nib.
          penState.x = u*u*u*from.x+3*u*u*t*(from.x+150)+3*u*t*t*(to.x-140)+t*t*t*to.x;
          penState.y = u*u*u*from.y+3*u*u*t*(from.y+95)+3*u*t*t*(to.y-90)+t*t*t*to.y;
          penState.tilt = from.tilt+(to.tilt-from.tilt)*t+14*Math.sin(Math.PI*t);
          renderPen();
        } }, flickEnd);
    } else {
      timeline.to(penState, { x: artwork.width*1.01, y: artwork.height+45, tilt: -22, opacity: 0,
          duration: 1.1, ease: 'sine.inOut', onUpdate: renderPen }, flickEnd);
    }
  });
  return timeline;
}
