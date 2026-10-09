/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const insertTrack = (tracks: readonly Extent[], index: number): Extent[] => {
  const next = [...tracks];
  next.splice(index + 1, 0, 'auto');
  return next;
};

export { insertTrack };
