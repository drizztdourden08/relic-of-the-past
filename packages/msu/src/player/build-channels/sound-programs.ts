/* @layer renderer-lib @kind logic */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import type { SoundProgram } from '../channel';

const soundPrograms = (manifest: MsuPackManifest, channel: SoundChannel): SoundProgram[] =>
  (manifest.sounds?.[channel] ?? []).map((sound) => ({
    id: sound.soundId, layers: sound.layers, group: sound.syncGroup,
  }));

export { soundPrograms };
