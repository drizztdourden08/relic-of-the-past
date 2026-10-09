/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const setTrackRange = (tracks: readonly Extent[], indices: readonly number[], next: Extent | undefined): Extent[] =>
  tracks.map((track, at) => (indices.includes(at) ? (next ?? 'auto') : track));

export { setTrackRange };
