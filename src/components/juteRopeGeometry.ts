export type Point = { x: number; y: number };

export const ropeDistance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mix = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const coords = ({ x, y }: Point) => `${x.toFixed(2)} ${y.toFixed(2)}`;

// Sample the centreline so the three twisted plies follow every bend of the bow.
export function sampleRope(d: string): Point[] {
  const tokens = d.match(/[MCL]|-?\d*\.?\d+/g) ?? [];
  const points: Point[] = [];
  let position = { x: 0, y: 0 };
  let i = 0;
  while (i < tokens.length) {
    const command = tokens[i++];
    const read = () => ({ x: Number(tokens[i++]), y: Number(tokens[i++]) });
    if (command === 'M') { position = read(); points.push(position); }
    else if (command === 'C') {
      const a = position, b = read(), c = read(), end = read();
      const length = Math.hypot(b.x-a.x,b.y-a.y) + Math.hypot(c.x-b.x,c.y-b.y) + Math.hypot(end.x-c.x,end.y-c.y);
      const steps = Math.max(12, Math.ceil(length / 1.2));
      for (let j = 1; j <= steps; j++) {
        const t = j / steps, s = 1-t;
        points.push({ x: s*s*s*a.x+3*s*s*t*b.x+3*s*t*t*c.x+t*t*t*end.x, y: s*s*s*a.y+3*s*s*t*b.y+3*s*t*t*c.y+t*t*t*end.y });
      }
      position = end;
    } else if (command === 'L') { position = read(); points.push(position); }
  }
  return points;
}

/** Round the knot and paper edges across SVG layers, using distance along the cord. */
export function roundRopeSections(sections: readonly Point[][], radius: number) {
  const points = [sections[0][0]];
  const distances = [0];
  const ends = sections.map(section => {
    for (const p of section.slice(1)) {
      const step = ropeDistance(points[points.length - 1], p);
      if (step < .0001) continue;
      points.push(p);
      distances.push(distances[distances.length - 1] + step);
    }
    return distances[distances.length - 1];
  });
  const total = ends[ends.length - 1];
  const at = (distance: number) => {
    let low = 0, high = distances.length - 1;
    while (high - low > 1) {
      const mid = (low + high) >> 1;
      if (distances[mid] <= distance) low = mid;
      else high = mid;
    }
    return mix(points[low], points[high], (distance - distances[low]) / (distances[high] - distances[low]));
  };
  return ends.map((end, i) => {
    const start = ends[i - 1] ?? 0;
    const count = Math.max(1, Math.ceil((end - start) / 8));
    return Array.from({ length: count + 1 }, (_, j) => {
      const distance = j === count ? end : start + (end - start) * j / count;
      const reach = Math.min(radius, distance, total - distance);
      const center = at(distance);
      if (!reach) return center;
      const near = mix(at(distance - reach * .5), at(distance + reach * .5), .5);
      const far = mix(at(distance - reach), at(distance + reach), .5);
      return mix(mix(near, center, 3 / 7), far, 1 / 8);
    });
  });
}

/** Use the same tangent on both sides of a layer boundary. */
export function ropeSpines(sections: readonly Point[][]) {
  const spine = sections.flatMap((section, i) => i === 0 ? section : section.slice(1));
  let start = 0;
  return sections.map(section => {
    const end = start + section.length - 1;
    const points = [spine[start]];
    let d = `M${coords(spine[start])}`;
    for (let i = start; i < end; i++) {
      const a = spine[Math.max(0, i - 1)], b = spine[i], c = spine[i + 1];
      const next = spine[Math.min(spine.length - 1, i + 2)];
      const control1 = { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 };
      const control2 = { x: c.x - (next.x - b.x) / 6, y: c.y - (next.y - b.y) / 6 };
      d += `C${coords(control1)} ${coords(control2)} ${coords(c)}`;
      const samples = Math.max(2, Math.ceil(ropeDistance(b, c) / 2.2));
      for (let j = 1; j <= samples; j++) {
        const t = j / samples, s = 1 - t;
        points.push({
          x: s ** 3 * b.x + 3 * s * s * t * control1.x + 3 * s * t * t * control2.x + t ** 3 * c.x,
          y: s ** 3 * b.y + 3 * s * s * t * control1.y + 3 * s * t * t * control2.y + t ** 3 * c.y,
        });
      }
    }
    start = end;
    return { d, points };
  });
}

export function ropeDetails(points: readonly Point[]) {
  const plies = ['', '', ''];
  const distances = [0];
  for (let i = 1; i < points.length; i++) distances.push(distances[i - 1] + ropeDistance(points[i - 1], points[i]));
  const total = distances[distances.length - 1];
  let hairs = '', segment = 1;
  // Space the fibres by length, so they don't jump when the curve tessellation changes.
  for (let index = 0; ; index++) {
    const distance = Math.min(index * 2, total);
    while (distances[segment] < distance && segment < points.length - 1) segment++;
    const a = points[segment - 1], b = points[segment];
    const length = distances[segment] - distances[segment - 1] || 1;
    const p = mix(a, b, (distance - distances[segment - 1]) / length);
    const dx = (b.x - a.x) / length, dy = (b.y - a.y) / length;
    const nx = -dy, ny = dx;
    for (let ply = 0; ply < 3; ply++) {
      const offset = Math.sin(distance * .65 + ply * Math.PI * 2 / 3) * 1.8;
      plies[ply] += `${index ? 'L' : 'M'}${(p.x+nx*offset).toFixed(2)} ${(p.y+ny*offset).toFixed(2)}`;
    }
    if (index % 13 === 5 && distance < total) {
      const side = index % 2 ? 1 : -1, reach = 3 + (index % 7);
      hairs += `M${coords({ x: p.x + nx * 2 * side, y: p.y + ny * 2 * side })}q${coords({
        x: nx * reach * side + dx * 3, y: ny * reach * side + dy * 3,
      })} ${coords({
        x: nx * (reach + 1) * side - dx * 2, y: ny * (reach + 1) * side - dy * 2,
      })}`;
    }
    if (distance >= total) break;
  }
  return { plies, hairs };
}

export function createRopePainter(group: Element) {
  const base = group.querySelectorAll('[data-rope-base]');
  const strands = Array.from({ length: 3 }, (_, i) => group.querySelectorAll(`[data-rope-ply="${i}"]`));
  const fibres = group.querySelector('[data-rope-hairs]');
  return ({ d, points }: { d: string; points: Point[] }) => {
    const { plies, hairs } = ropeDetails(points);
    base.forEach(path => path.setAttribute('d', d));
    strands.forEach((paths, i) => paths.forEach(path => path.setAttribute('d', plies[i])));
    fibres?.setAttribute('d', hairs);
  };
}
