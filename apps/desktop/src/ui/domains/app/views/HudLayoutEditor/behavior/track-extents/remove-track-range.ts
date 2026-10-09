/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const removeTrackRange = (tracks: readonly Extent[], indices: readonly number[]): Extent[] =>
  tracks.filter((_unused, at) => !indices.includes(at));

export { removeTrackRange };
