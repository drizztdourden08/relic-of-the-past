/* @layer renderer-components @kind logic */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-defs-of-channel';
import { withChannelDefs } from './with-channel-defs';

const withoutSound = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): MsuPackManifest => withChannelDefs(
  manifest,
  channel,
  soundDefsOfChannel(manifest, channel).filter((sound) => sound.soundId !== soundId),
);

export { withoutSound };
