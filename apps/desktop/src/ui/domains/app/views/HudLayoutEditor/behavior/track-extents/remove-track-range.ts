/* @layer renderer-components @kind logic */
import type { Extent } from '@shared/types/hud';

const removeTrackRange = (tracks: readonly Extent[], indices: readonly number[]): Extent[] =>
  tracks.filter((_unused, at) => !indices.includes(at));

export { removeTrackRange };
