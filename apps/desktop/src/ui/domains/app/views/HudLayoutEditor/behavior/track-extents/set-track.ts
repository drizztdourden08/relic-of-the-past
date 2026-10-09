/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const setTrack = (tracks: readonly Extent[], index: number, next: Extent | undefined): Extent[] =>
  tracks.map((track, at) => (at === index ? (next ?? 'auto') : track));

export { setTrack };
