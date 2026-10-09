/* @layer renderer-components @kind logic */
import type { Extent } from '@shared/types/hud';

const removeTrack = (tracks: readonly Extent[], index: number): Extent[] =>
  tracks.filter((_unused, at) => at !== index);

export { removeTrack };
