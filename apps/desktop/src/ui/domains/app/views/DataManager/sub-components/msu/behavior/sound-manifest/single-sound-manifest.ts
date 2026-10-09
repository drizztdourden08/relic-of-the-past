/* @layer renderer-components @kind logic */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import { soundDefsOfChannel } from './sound-defs-of-channel';

const singleSoundManifest = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): MsuPackManifest => ({
  ...manifest,
  tracks: [],
  sounds: {
    [channel]: soundDefsOfChannel(manifest, channel).filter((sound) => sound.soundId === soundId),
  },
});

export { singleSoundManifest };
