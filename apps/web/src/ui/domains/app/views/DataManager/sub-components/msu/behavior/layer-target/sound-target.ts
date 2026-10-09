/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { layersOfSound, withSoundLayers } from '../sound-manifest';
import { soundPreviewKey } from '../preview-key';
import { soundTitle } from '../../sound-labels';
import type { LayerTarget } from './layer-target.type';

const soundTarget = (channel: SoundChannel, soundId: number): LayerTarget => ({
  previewKey: soundPreviewKey(channel, soundId),
  label: soundTitle(channel, soundId),
  read: (manifest) => layersOfSound(manifest, channel, soundId),
  write: (base, layers) => withSoundLayers(base, channel, soundId, layers),
  oneShot: channel !== 'ambient',
});

export { soundTarget };
