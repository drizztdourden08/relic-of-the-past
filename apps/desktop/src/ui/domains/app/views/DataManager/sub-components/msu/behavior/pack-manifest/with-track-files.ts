/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { layersOfTrack } from './layers-of-track';
import { withTrackLayers } from './with-track-layers';
import { bodyLayer } from './body-layer';

const withTrackFiles = (
  manifest: MsuPackManifest, trackNum: number, files: string[],
): MsuPackManifest => {
  const layers = layersOfTrack(manifest, trackNum);
  if (layers.length === 0) {
    return files.length === 0 ? manifest : withTrackLayers(manifest, trackNum, [bodyLayer(trackNum, files)]);
  }
  return withTrackLayers(manifest, trackNum, layers.map((layer, i) => (i === 0 ? { ...layer, files } : layer)));
};

export { withTrackFiles };
