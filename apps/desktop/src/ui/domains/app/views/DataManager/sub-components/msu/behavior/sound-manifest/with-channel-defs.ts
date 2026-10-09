/* @layer renderer-components @kind logic */
import type { MsuPackManifest, MsuSoundDef, SoundChannel } from '@rotp/game-data';

const withChannelDefs = (
  manifest: MsuPackManifest, channel: SoundChannel, defs: MsuSoundDef[],
): MsuPackManifest => {
  const next: Partial<Record<SoundChannel, MsuSoundDef[]>> = {};
  for (const [name, existing] of Object.entries(manifest.sounds ?? {})) {
    if (name !== channel && existing.length > 0) next[name as SoundChannel] = existing;
  }
  if (defs.length > 0) next[channel] = defs;
  return { ...manifest, sounds: Object.keys(next).length > 0 ? next : undefined };
};

export { withChannelDefs };
