/* @layer renderer-components @kind logic */
import { layersOfTrack, withTrackLayers } from '../pack-manifest';
import { trackPreviewKey } from '../preview-key';
import type { LayerTarget } from './layer-target.type';

const trackTarget = (trackNum: number): LayerTarget => ({
  previewKey: trackPreviewKey(trackNum),
  label: `slot ${trackNum}`,
  read: (manifest) => layersOfTrack(manifest, trackNum),
  write: (base, layers) => withTrackLayers(base, trackNum, layers),
  oneShot: false,
});

export { trackTarget };
