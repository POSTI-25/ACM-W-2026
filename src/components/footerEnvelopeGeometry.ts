/** Register the flap to the pocket's actual paper edge, not its transparent box. */
export function footerEnvelopeGeometry(width: number, height: number) {
  const pocketScale = 1.6;
  const side = Math.min(width, height);
  // The square pocket PNG starts its paper at y=400, with corners at x=10/1190.
  const hingeY = height / 2 + ((height - side) / 2 + side / 3 - height / 2) * pocketScale;
  const hingeWidth = side * pocketScale * (1180 / 1200);
  return { flapScale: hingeWidth / width, flapY: hingeY - width * (235 / 549) };
}
