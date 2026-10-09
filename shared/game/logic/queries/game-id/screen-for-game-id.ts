/* @layer shared-game @kind logic */
import { find, getScreenByGameId } from '../../../data';
import type { ScreenRecord } from '../../../data';
import type { GameScreenId } from './game-id.type';

const anyPalaceHoldingRoom = (room: number): ScreenRecord | undefined =>
  find('screen', s => s.gameId.roomIndex === room && s.gameId.palaceIndex !== undefined)[0];

const screenForGameId = (gameId: GameScreenId): ScreenRecord | undefined => {
  if (gameId.kind === 'overworld') return getScreenByGameId({ overworldIndex: gameId.screen });

  if (gameId.palace !== undefined) {
    const exact = getScreenByGameId({ roomIndex: gameId.room, palaceIndex: gameId.palace });
    if (exact) return exact;
    const anyPalace = anyPalaceHoldingRoom(gameId.room);
    if (anyPalace) return anyPalace;
  }
  return getScreenByGameId({ roomIndex: gameId.room });
};

export { screenForGameId };
