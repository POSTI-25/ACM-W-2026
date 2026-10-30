type Point = { x: number; y: number };

// Ordered sections of ONE cord: front -> behind -> front -> behind -> front.
// The endpoints are shared across layers, so the hidden return lengths emerge
// from under the paper as the complete cord slides down.
export function landingRopeSegments(x = 0, y = 0, loosen = 0) {
  const mix = (tied: number, loose: number) => tied + (loose - tied) * loosen;
  return [
    { side: 'front', d: `M191 386
      C207 375 233 353 250 326 C272 294 285 252 300 230
      C${mix(270, 266)} ${mix(190, 223)} ${mix(214, 218)} ${mix(196, 247)} ${mix(223, 210)} ${mix(221, 268)}
      C${mix(233, 235)} ${mix(247, 278)} ${mix(277, 276)} ${mix(244, 250)} 300 230
      C298 184 291 123 294 71` },
    { side: 'rear', d: `M294 71
      C${mix(292, 220)} 180 ${mix(298, 230)} 300 301 399` },
    { side: 'front', d: `M301 399
      C303 344 300 279 304 231
      C${mix(320, 333)} ${mix(187, 216)} ${mix(374, 384)} ${mix(165, 226)} ${mix(369, 409)} ${mix(196, 251)}
      C${mix(363, 385)} ${mix(222, 269)} ${mix(327, 335)} ${mix(230, 251)} 300 230
      C300 279 303 344 308 399` },
    { side: 'rear', d: `M308 399
      C${mix(311, 400)} 300 ${mix(305, 385)} 180 302 71` },
    { side: 'front', d: `M302 71
      C300 135 306 191 304 231
      C${mix(291, 298)} ${mix(218, 227)} ${mix(287, 296)} ${mix(236, 232)} 300 ${mix(237, 234)}
      C${mix(315, 305)} ${mix(238, 235)} ${mix(309, 304)} ${mix(220, 230)} 300 230
      C345 227 ${394 + x * .65} ${248 + y * .65} ${437 + x} ${283 + y}` },
  ] as const;
}

/** All sections share the same motion; only paper occlusion differs. */
export function updateLandingRope(stage: Element, x = 0, y = 0, loosen = 0) {
  landingRopeSegments(x, y, loosen).forEach((segment, index) => {
    const group = stage.querySelector(`[data-rope-segment="${index}"]`);
    if (group) updateRope(group, segment.d);
  });
}

// Sample the centreline so the three twisted plies follow every bend of the bow.
function sampleRope(d: string): Point[] {
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

export function ropeDetails(d: string) {
  const points = sampleRope(d);
  const plies = ['', '', ''];
  let hairs = '', distance = 0;
  points.forEach((p, index) => {
    const prev = points[Math.max(0,index-1)], next = points[Math.min(points.length-1,index+1)];
    const dx = next.x-prev.x, dy = next.y-prev.y, length = Math.hypot(dx,dy) || 1;
    const nx = -dy/length, ny = dx/length;
    if (index) distance += Math.hypot(p.x-prev.x,p.y-prev.y);
    for (let ply = 0; ply < 3; ply++) {
      const offset = Math.sin(distance * .65 + ply * Math.PI * 2 / 3) * 1.8;
      plies[ply] += `${index ? 'L' : 'M'}${(p.x+nx*offset).toFixed(2)} ${(p.y+ny*offset).toFixed(2)}`;
    }
    if (index % 13 === 5) {
      const side = index % 2 ? 1 : -1, reach = 3 + (index % 7);
      hairs += `M${p.x+nx*2*side} ${p.y+ny*2*side}q${nx*reach*side+dx/length*3} ${ny*reach*side+dy/length*3} ${nx*(reach+1)*side-dx/length*2} ${ny*(reach+1)*side-dy/length*2}`;
    }
  });
  return { plies, hairs };
}

export function updateRope(group: Element, d: string) {
  group.querySelectorAll('[data-rope-base]').forEach(path => path.setAttribute('d', d));
  const { plies, hairs } = ropeDetails(d);
  group.querySelectorAll('[data-rope-ply]').forEach(path => path.setAttribute('d', plies[Number(path.getAttribute('data-rope-ply'))]));
  group.querySelector('[data-rope-hairs]')?.setAttribute('d', hairs);
}
