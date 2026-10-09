/* @layer renderer-lib @kind logic */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import { claimableIds } from './claimable-ids';

const manifestSoundIds = (manifest: MsuPackManifest, channel: SoundChannel): number[] =>
  claimableIds((manifest.sounds?.[channel] ?? [])
    .filter((sound) => sound.layers.length > 0)
    .map((sound) => sound.soundId));

export { manifestSoundIds };
