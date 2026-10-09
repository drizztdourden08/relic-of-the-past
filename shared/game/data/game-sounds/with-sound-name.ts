/* @layer shared-game-data @kind logic */
import { soundName } from '../sound-names';
import type { GameSound, RawGameSound } from './game-sounds.type';

const withSoundName = (sound: RawGameSound): GameSound =>
  ({ ...sound, label: soundName(sound.channel, sound.id) });

export { withSoundName };
