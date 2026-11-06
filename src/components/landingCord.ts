import { createRopePainter, ropeSpines, roundRopeSections, sampleRope, type Point } from './juteRopeGeometry.ts';
import { createCordFall } from './landingCordPhysics.ts';

type Cubic = [Point, Point, Point, Point];
type Pull = Point & { progress: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
const point = (x: number, y: number): Point => ({ x, y });
const curve = (from: Point, x1: number, y1: number, x2: number, y2: number, to: Point): Cubic =>
  [from, point(x1, y1), point(x2, y2), to];
const svgPoint = ({ x, y }: Point) => `${x.toFixed(2)} ${y.toFixed(2)}`;
const path = (curves: Cubic[]) => `M${svgPoint(curves[0][0])}` + curves.map(
  ([, a, b, end]) => `C${svgPoint(a)} ${svgPoint(b)} ${svgPoint(end)}`,
).join('');

function length([a, b, c, d]: Cubic) {
  let total = 0, previous = a;
  for (let i = 1; i <= 16; i++) {
    const t = i / 16, s = 1 - t;
    const next = point(
      s ** 3 * a.x + 3 * s * s * t * b.x + 3 * s * t * t * c.x + t ** 3 * d.x,
      s ** 3 * a.y + 3 * s * s * t * b.y + 3 * s * t * t * c.y + t ** 3 * d.y,
    );
    total += Math.hypot(next.x - previous.x, next.y - previous.y);
    previous = next;
  }
  return total;
}

export const FULL_PULL = 120;

export function landingPull(x: number, y: number): Pull {
  const distance = Math.hypot(x, y);
  const yieldDistance = 12;
  const progress = clamp((distance - yieldDistance) / (FULL_PULL - yieldDistance), 0, 1);
  const reach = Math.min(yieldDistance, distance) * .28 + (FULL_PULL - yieldDistance) * progress * .7;
  const scale = reach / (distance || 1);
  return { x: x * scale, y: y * scale, progress };
}

// Each loop is defined relative to its own knot and shrinks around that knot.
const leftLoop = [[-30, -40, -86, -34, -77, -9], [-67, 17, -23, 14, 0, 0]];
const rightLoop = [[16, -44, 70, -66, 65, -35], [59, -9, 23, -1, 0, 0]];
const knotLoop = [[-13, -13, -17, 5, -4, 6], [11, 7, 5, -11, 0, 0]];

function loop(knot: Point, scale: number, handles: number[][]): Cubic[] {
  if (scale === 0) return [];
  let start = knot;
  return handles.map(([x1, y1, x2, y2, x, y]) => {
    const end = point(knot.x + x * scale, knot.y + y * scale);
    const result = curve(start, knot.x + x1 * scale, knot.y + y1 * scale,
      knot.x + x2 * scale, knot.y + y2 * scale, end);
    start = end;
    return result;
  });
}

function cordParts(progress: number) {
  const slide = smooth((progress - .21) / .62);
  const returnSlide = smooth((progress - .29) / .65);
  const lip = Math.sin(slide * Math.PI);
  const returnLip = Math.sin(returnSlide * Math.PI);
  const top = point(294 + 264 * slide, 71 - 12 * lip + 92 * smooth((progress - .72) / .28));
  const bottom = point(301 + 179 * slide, 399 + 12 * lip + 19 * slide);
  const returnTop = point(302 + 268 * returnSlide,
    71 - 16 * returnLip + 117 * smooth((progress - .82) / .18));
  const returnBottom = point(308 + 207 * returnSlide, 399 + 13 * returnLip + 29 * returnSlide);

  const knot = point(300 + 174 * slide, 230 + 86 * slide);
  const rightKnot = point(knot.x + 4 * (1 - slide), knot.y + 1 - slide);
  const tailKnot = point(knot.x + 4 * (1 - returnSlide), knot.y + 1 - returnSlide);
  const looseEnd = point(191 + 104 * slide, 386 + 41 * slide);
  const leftScale = 1 - smooth(progress / .89);
  const rightScale = 1 - smooth(progress / .72);
  const knotScale = 1 - smooth((progress - .38) / .58);
  // A short shared tangent lets each wrap turn continuously over the paper lip.
  const edge = 22;

  return [
    [
      curve(looseEnd, 220 + 100 * slide, 368 + 46 * slide, knot.x - 21, knot.y + 37, knot),
      ...loop(knot, leftScale, leftLoop),
      curve(knot, knot.x - 2, knot.y - 46, top.x - edge, top.y, top),
    ],
    [
      curve(top, top.x + edge + 40 * slide, top.y, bottom.x + edge + 32 * slide, bottom.y, bottom),
    ],
    [
      curve(bottom, bottom.x - edge - 20 * slide, bottom.y, rightKnot.x - 5 - 33 * slide, rightKnot.y + 34 * (1 - slide), rightKnot),
      ...loop(rightKnot, rightScale, rightLoop),
      curve(rightKnot, rightKnot.x + 31 * slide, rightKnot.y + 48 * (1 - slide),
        returnBottom.x - edge, returnBottom.y, returnBottom),
    ],
    [
      curve(returnBottom, returnBottom.x + edge + 33 * returnSlide, returnBottom.y,
        returnTop.x + edge + 37 * returnSlide, returnTop.y, returnTop),
    ],
    [
      curve(returnTop, returnTop.x - edge - 26 * returnSlide, returnTop.y,
        tailKnot.x + 2 - 40 * returnSlide, tailKnot.y - 40 * (1 - returnSlide), tailKnot),
      ...loop(tailKnot, knotScale, knotLoop),
    ],
  ];
}

function tail(knot: Point, x: number, y: number, feed = 0): Cubic {
  return curve(knot, knot.x + 45 + x * .12 + feed * .16, knot.y - 3 + y * .1,
    knot.x + 94 + x * .65 + feed * .68, knot.y + 18 + y * .65 + feed * .06,
    point(knot.x + 137 + x + feed, knot.y + 53 + y + feed * .08));
}

const tiedLength = cordParts(0).flat().reduce((sum, segment) => sum + length(segment), 0) + length(tail(point(304, 231), 0, 0));

export function landingCordPose(pull = landingPull(0, 0)) {
  const parts = cordParts(pull.progress);
  const front = parts[4];
  const knot = front[front.length - 1][3];
  const x = clamp(pull.x, -42, 80), y = clamp(pull.y, -48, 45);
  const remainingLength = parts.flat().reduce((sum, segment) => sum + length(segment), 0);
  // Length lost by the shrinking loops and by the hidden wraps feeds the free
  // tail. A small amount of stretch from the hand disappears as the knot opens.
  const tailLength = Math.max(60, tiedLength - remainingLength + Math.hypot(x, y) * (1 - pull.progress) * .55);
  let low = -75, high = 680;
  for (let i = 0; i < 12; i++) {
    const feed = (low + high) / 2;
    if (length(tail(knot, x, y, feed)) < tailLength) low = feed;
    else high = feed;
  }
  const free = tail(knot, x, y, (low + high) / 2);
  front.push(free);
  const rounded = roundRopeSections(parts.map(curves => sampleRope(path(curves))), 10 + 26 * smooth(pull.progress));
  return {
    sections: ropeSpines(rounded).map((spine, i) => ({ ...spine, side: i % 2 === 0 ? 'front' : 'rear' })),
    tail: path([free]),
    tip: free[3],
  };
}

export function createLandingCordRenderer(stage: Element) {
  const painters = Array.from({ length: 5 }, (_, i) => {
    const group = stage.querySelector(`[data-rope-segment="${i}"]`);
    return group && createRopePainter(group);
  });
  const draw = (pose: ReturnType<typeof landingCordPose>) => {
    pose.sections.forEach((spine, i) => painters[i]?.(spine));
  };
  const release = (pose: ReturnType<typeof landingCordPose>, direction: Point) => {
    const fall = createCordFall(pose.sections.map(({ points }) => points), direction);
    // Cache the simulation at a fixed interval so scrolling back can replay
    // the same bends, regardless of the direction or speed of the scroll.
    const frames = [fall.paths().map(points => points.map(p => ({ x: p.x, y: p.y })))];
    return (time: number, viewportBottom: number) => {
      const frame = time * 60;
      const index = Math.floor(frame);
      while (frames.length <= index + 1) {
        fall.step(1 / 60);
        frames.push(fall.paths());
      }
      const ratio = frame - index;
      const points = frames[index].map((section, i) => section.map((p, j) => {
        const next = frames[index + 1][i][j];
        return { x: p.x + (next.x - p.x) * ratio, y: p.y + (next.y - p.y) * ratio };
      }));
      const spines = ropeSpines(points);
      spines.forEach((spine, i) => painters[i]?.(spine));
      // Keep drawing until even the fibres and shadow have cleared the stage.
      return spines.every(({ points }) => points.every(p => p.y > viewportBottom + 14));
    };
  };
  return { draw, release };
}
