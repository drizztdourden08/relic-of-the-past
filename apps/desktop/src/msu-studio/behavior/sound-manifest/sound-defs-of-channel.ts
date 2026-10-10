/* @layer renderer-components @kind logic */
import type { MsuPackManifest, MsuSoundDef, SoundChannel } from '@rotp/game-data';

const soundDefsOfChannel = (manifest: MsuPackManifest, channel: SoundChannel): MsuSoundDef[] =>
  manifest.sounds?.[channel] ?? [];

export { soundDefsOfChannel };
