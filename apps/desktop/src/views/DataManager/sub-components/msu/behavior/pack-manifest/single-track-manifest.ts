/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';

const singleTrackManifest = (manifest: MsuPackManifest, trackNum: number): MsuPackManifest => ({
  ...manifest,
  tracks: manifest.tracks.filter((t) => t.trackNum === trackNum),
});

export { singleTrackManifest };
