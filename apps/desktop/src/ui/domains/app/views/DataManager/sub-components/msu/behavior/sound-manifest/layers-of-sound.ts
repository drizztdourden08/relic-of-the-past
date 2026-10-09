/* @layer renderer-components @kind logic */
import type { MsuLayer, MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-defs-of-channel';

const layersOfSound = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): MsuLayer[] =>
  soundDefsOfChannel(manifest, channel).find((sound) => sound.soundId === soundId)?.layers ?? [];

export { layersOfSound };
