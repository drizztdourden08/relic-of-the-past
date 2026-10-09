/* @layer renderer-components @kind logic */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-defs-of-channel';
import { withChannelDefs } from './with-channel-defs';

const withSoundGroup = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number, group: string | undefined,
): MsuPackManifest => {
  const defs = soundDefsOfChannel(manifest, channel);
  if (!defs.some((sound) => sound.soundId === soundId)) return manifest;
  const next = defs.map((sound) => (sound.soundId === soundId
    ? { ...sound, syncGroup: group === '' ? undefined : group }
    : sound));
  return withChannelDefs(manifest, channel, next);
};

export { withSoundGroup };
