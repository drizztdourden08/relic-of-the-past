/* @layer shared-game-data @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import type { GameSound } from './game-sounds.type';
import { GAME_SOUNDS } from './game-sounds.data';
import { withSoundName } from './with-sound-name';

const gameSound = (channel: SoundChannel, id: number): GameSound | undefined => {
  const found = GAME_SOUNDS.find((s) => s.channel === channel && s.id === id);
  return found === undefined ? undefined : withSoundName(found);
};

export { gameSound };
