/* @layer shared-game-data @kind logic */
import type { SoundChannel } from '../../manifest/msu-manifest.type';
import { SOUND_NAMES_BY_KEY } from './sound-names.constants';

const namedSoundCount = (channel: SoundChannel): number =>
  [...SOUND_NAMES_BY_KEY.keys()].filter((key) => key.startsWith(`${channel}:`)).length;

export { namedSoundCount };
