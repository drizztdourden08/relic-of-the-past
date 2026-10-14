/* @layer renderer-app @kind logic */
import { getScreenByGameId, screenForRoomIndex } from '@rotp/game-data';
import type { ScreenGameId, ScreenRecord } from '@rotp/game-data';

const coveringScreen = (gameId: ScreenGameId | undefined): ScreenRecord | undefined => {
  if (!gameId) return undefined;
  if (gameId.overworldIndex !== undefined) return getScreenByGameId({ overworldIndex: gameId.overworldIndex });
  if (gameId.roomIndex === undefined) return undefined;
  return getScreenByGameId({ roomIndex: gameId.roomIndex, palaceIndex: gameId.palaceIndex })
    ?? screenForRoomIndex(gameId.roomIndex);
};

export { coveringScreen };
