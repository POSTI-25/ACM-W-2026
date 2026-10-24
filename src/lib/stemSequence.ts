export const STEM_CHAPTER_SCREENS = 6;
export const STEM_PHASE = {
  enterEnd: .1,
  spinEnd: .45,
  highlightEnd: .52,
  mapEnd: .65,
  portraitEnd: .77,
  holdEnd: .87,
  exitEnd: 1,
} as const;

/** A full revolution plus the small alignment arc, without an on-screen reset. */
export function countrySpin(lng: number, lat: number, previousY?: number) {
  const focusY = -(Math.PI / 2 + lng * Math.PI / 180);
  const fromY = previousY ?? focusY + Math.PI * 2;
  const alignment = Math.atan2(Math.sin(focusY - fromY), Math.cos(focusY - fromY));
  const direction = alignment > 1e-8 ? 1 : -1;
  return { fromY, toY: fromY + direction * Math.PI * 2 + alignment, tilt: lat * Math.PI / 180 };
}

export function stemSceneAt(time: number, count: number) {
  const index = Math.min(count - 1, Math.max(0, Math.floor(time)));
  return { index, progress: Math.min(1, Math.max(0, time - index)) };
}
