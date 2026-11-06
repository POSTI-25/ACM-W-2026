import { ropeDistance, roundRopeSections, type Point } from './juteRopeGeometry.ts';

const STEP = 1 / 120;
const GRAVITY = 1800;
const PAPER_BOTTOM = 398;

type Particle = Point & { previous: Point };

function constrain(a: Particle, b: Particle, length: number, bend = false) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || (bend && distance >= length)) return;
  const correction = (distance - length) * (bend ? .25 : .5) / distance;
  a.x += dx * correction;
  a.y += dy * correction;
  b.x -= dx * correction;
  b.y -= dy * correction;
}

export function createCordFall(sections: readonly Point[][], direction: Point) {
  const particles: Particle[] = [];
  const lengths: number[] = [];
  const ranges = roundRopeSections(sections, 0).map(section => {
    const start = Math.max(0, particles.length - 1);
    // Share a particle wherever the rope changes SVG layers.
    for (const p of particles.length ? section.slice(1) : section) {
      if (particles.length) lengths.push(ropeDistance(p, particles[particles.length - 1]));
      particles.push({ ...p, previous: { ...p } });
    }
    return { start, end: particles.length - 1 };
  });

  const pull = Math.hypot(direction.x, direction.y) || 1;
  particles.forEach((particle, i) => {
    const t = i / (particles.length - 1);
    // The pulled end carries some momentum; the other end lags and drapes.
    particle.previous.x -= (-64 + 120 * t + 96 * direction.x / pull * t ** 3) * STEP;
    particle.previous.y -= (26 + 44 * t + 62 * direction.y / pull * t ** 3) * STEP;
  });
  const bends = lengths.slice(1).map((length, i) =>
    Math.min(ropeDistance(particles[i], particles[i + 2]), .94 * (lengths[i] + length)));

  let accumulator = 0;
  let started = false;

  const step = (elapsed: number) => {
    accumulator += Math.min(elapsed, .06);
    while (accumulator >= STEP) {
      accumulator -= STEP;
      started = true;
      for (const particle of particles) {
        const { x, y, previous } = particle;
        // A soft band of friction at the lip briefly slows the sections
        // passing over the envelope, without catching the falling rope.
        const rim = x > 45 && x < 555 ? Math.max(0, 1 - Math.abs(y - PAPER_BOTTOM) / 20) : 0;
        const damping = .994 - .052 * rim ** 2;
        particle.x += (x - previous.x) * damping;
        particle.y += (y - previous.y) * damping + GRAVITY * STEP ** 2;
        previous.x = x;
        previous.y = y;
      }
      for (let pass = 0; pass < 8; pass++) {
        lengths.forEach((length, i) => constrain(particles[i], particles[i + 1], length));
        bends.forEach((length, i) => constrain(particles[i], particles[i + 2], length, true));
      }
    }
  };

  const paths = () => {
    if (!started) return ranges.map(({ start, end }) => particles.slice(start, end + 1));
    // Interpolate between fixed steps so the cord moves smoothly on any refresh rate.
    const t = accumulator / STEP;
    const positions = particles.map(({ x, y, previous }) => ({
      x: previous.x + (x - previous.x) * t,
      y: previous.y + (y - previous.y) * t,
    }));
    return ranges.map(({ start, end }) => positions.slice(start, end + 1));
  };

  return { step, paths };
}
