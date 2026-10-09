/* @layer renderer-components @kind logic */
import type { Extent } from '@shared/types/hud';

const insertTrackBefore = (tracks: readonly Extent[], index: number): Extent[] => {
  const next = [...tracks];
  next.splice(Math.max(0, index), 0, 'auto');
  return next;
};

export { insertTrackBefore };
