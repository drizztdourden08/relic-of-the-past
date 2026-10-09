/* @layer renderer-components @kind logic */
import type { MsuPackManifest, MsuSoundDef, SoundChannel } from '@shared/types/msu-manifest';

const soundDefsOfChannel = (manifest: MsuPackManifest, channel: SoundChannel): MsuSoundDef[] =>
  manifest.sounds?.[channel] ?? [];

export { soundDefsOfChannel };
