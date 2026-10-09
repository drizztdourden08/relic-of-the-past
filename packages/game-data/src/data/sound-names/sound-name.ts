/* @layer shared-game-data @kind logic */
import type { SoundChannel } from '../../manifest/msu-manifest.type';
import { SOUND_NAMES_BY_KEY } from './sound-names.constants';
import { soundKey } from './sound-key';

const soundName = (channel: SoundChannel, id: number): string | null =>
  SOUND_NAMES_BY_KEY.get(soundKey(channel, id)) ?? null;

export { soundName };
