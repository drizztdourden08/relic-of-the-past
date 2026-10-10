/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const moveTrack = (tracks: readonly Extent[], index: number, by: number): Extent[] => {
  const to = index + by;
  if (to < 0 || to >= tracks.length) return [...tracks];
  const next = [...tracks];
  const moved = next.splice(index, 1);
  next.splice(to, 0, ...moved);
  return next;
};

export { moveTrack };
