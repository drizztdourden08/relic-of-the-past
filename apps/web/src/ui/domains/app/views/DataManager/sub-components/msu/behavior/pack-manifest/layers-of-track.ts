/* @layer renderer-components @kind logic */
import type { MsuLayer, MsuPackManifest } from '@shared/types/msu-manifest';

const layersOfTrack = (manifest: MsuPackManifest, trackNum: number): MsuLayer[] =>
  manifest.tracks.find((t) => t.trackNum === trackNum)?.layers ?? [];

export { layersOfTrack };
