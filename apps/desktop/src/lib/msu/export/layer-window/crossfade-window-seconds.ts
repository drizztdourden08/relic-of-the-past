/* @layer renderer-lib @kind logic */
const crossfadeWindowSeconds = (durationSeconds: number, crossfade: number): number =>
  Math.max(0, Math.min(crossfade, durationSeconds / 2));

export { crossfadeWindowSeconds };
