/* @layer shared-game-data @kind logic */
import type { SoundChannel } from '../../manifest/msu-manifest.type';
import type { GameSound } from './game-sounds.type';
import { GAME_SOUNDS } from './game-sounds.constants';
import { withSoundName } from './with-sound-name';

const soundsOfChannel = (channel: SoundChannel): GameSound[] =>
  GAME_SOUNDS.filter((s) => s.channel === channel).sort((a, b) => b.sites - a.sites).map(withSoundName);

export { soundsOfChannel };
