/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { layersOfTrack, withTrackLayers } from '../pack-manifest';
import { trackPreviewKey } from '../preview-key';
import type { LayerTarget } from './layer-target.type';

const trackTarget = (t: I18n['t'], trackNum: number): LayerTarget => ({
  previewKey: trackPreviewKey(trackNum),
  label: t('msu-studio:track.label', { number: trackNum }),
  read: (manifest) => layersOfTrack(manifest, trackNum),
  write: (base, layers) => withTrackLayers(base, trackNum, layers),
  oneShot: false,
});

export { trackTarget };
