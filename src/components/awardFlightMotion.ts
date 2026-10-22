const TAU = Math.PI * 2;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const smooth = (start: number, end: number, phase: number) => {
  const t = clamp((phase - start) / (end - start), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export type FlightPose = {
  x: number; y: number; z: number;
  dx: number; dy: number; dz: number;
  bank: number; roll: number; orbit: number;
};

/** Two spatial figure-eights per camera orbit. Reuse `out` in the render loop. */
export function sampleAwardFlight(phase: number, width: number, height: number, out: FlightPose): FlightPose {
  // Positive speed throughout: fast straight crossovers, slow lobe apexes.
  const theta = TAU * (2 * phase + .035 * Math.sin(TAU * 4 * phase));
  const a = width * .72, b = height * .40, c = height * .045;
  const dx = a * Math.cos(theta);
  const dy = 2 * b * Math.cos(2 * theta) + 3 * c * Math.cos(3 * theta);
  const ddx = -a * Math.sin(theta);
  const ddy = -4 * b * Math.sin(2 * theta) - 9 * c * Math.sin(3 * theta);
  const curvature = (dx * ddy - dy * ddx) / Math.max(1, Math.pow(dx * dx + dy * dy, 1.5));
  out.x = a * Math.sin(theta);
  out.y = b * Math.sin(2 * theta) + c * Math.sin(3 * theta);
  out.z = height * (.22 * Math.cos(theta) + .10 * Math.sin(3 * theta));
  out.dx = dx;
  out.dy = dy;
  out.dz = height * (-.22 * Math.sin(theta) + .30 * Math.cos(3 * theta));
  const inverted = smooth(.48, .58, phase) - smooth(.67, .77, phase);
  out.bank = clamp(curvature * a * 1.25, -Math.PI / 2, Math.PI / 2) * (1 - inverted);
  out.roll = TAU * smooth(.10, .27, phase) - TAU * smooth(.80, .97, phase)
    + Math.PI * inverted;
  out.orbit = Math.PI * .75 + TAU * phase + .24 * Math.sin(TAU * 2 * phase);
  return out;
}

export function awardHeartCue(phase: number) {
  return {
    blend: smooth(.30, .36, phase) - smooth(.50, .56, phase),
    progress: clamp((phase - .36) / .14, 0, 1),
    cameraPhase: phase < .30 ? phase : .30 + (phase - .30) * smooth(.58, .72, phase),
    lifetime: 3.2 + 2.8 * (smooth(.30, .36, phase) - smooth(.59, .67, phase)),
  };
}

/** A closed heart, rather than a heart icon emitted by an unrelated path. */
export function sampleHeartOutline(progress: number, out: { x: number; y: number }) {
  const t = TAU * progress;
  out.x = Math.pow(Math.sin(t), 3);
  out.y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) / 14.5;
  return out;
}
