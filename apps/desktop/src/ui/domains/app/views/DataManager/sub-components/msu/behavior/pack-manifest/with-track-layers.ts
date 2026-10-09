/* @layer renderer-components @kind logic */
import type { MsuLayer, MsuPackManifest, MsuTrackDef } from '@shared/types/msu-manifest';

const withTrackLayers = (
  manifest: MsuPackManifest, trackNum: number, layers: MsuLayer[],
): MsuPackManifest => {
  const replaced: MsuTrackDef = { trackNum, layers };
  const tracks = manifest.tracks.some((t) => t.trackNum === trackNum)
    ? manifest.tracks.map((t) => (t.trackNum === trackNum ? replaced : t))
    : [...manifest.tracks, replaced].sort((a, b) => a.trackNum - b.trackNum);
  return { ...manifest, tracks };
};

export { withTrackLayers };
