/* @layer renderer-components @kind logic */
import type { MsuLayer, MsuPackManifest, MsuSoundDef, SoundChannel } from '@rotp/game-data';
import { soundDefsOfChannel } from './sound-defs-of-channel';
import { withChannelDefs } from './with-channel-defs';

const withSoundLayers = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number, layers: MsuLayer[],
): MsuPackManifest => {
  const defs = soundDefsOfChannel(manifest, channel);
  const existing = defs.find((sound) => sound.soundId === soundId);
  const replaced: MsuSoundDef = { ...existing, soundId, layers };
  const next = existing
    ? defs.map((sound) => (sound.soundId === soundId ? replaced : sound))
    : [...defs, replaced].sort((a, b) => a.soundId - b.soundId);
  return withChannelDefs(manifest, channel, next);
};

export { withSoundLayers };
