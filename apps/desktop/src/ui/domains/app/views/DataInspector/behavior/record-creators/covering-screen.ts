/* @layer renderer-app @kind logic */
import { getScreenByGameId } from '@shared/game/data';
import { screenForRoomIndex } from '@shared/game/logic/queries/room-screen';
import type { ScreenGameId, ScreenRecord } from '@shared/game/data';

const coveringScreen = (gameId: ScreenGameId | undefined): ScreenRecord | undefined => {
  if (!gameId) return undefined;
  if (gameId.overworldIndex !== undefined) return getScreenByGameId({ overworldIndex: gameId.overworldIndex });
  if (gameId.roomIndex === undefined) return undefined;
  return getScreenByGameId({ roomIndex: gameId.roomIndex, palaceIndex: gameId.palaceIndex })
    ?? screenForRoomIndex(gameId.roomIndex);
};

export { coveringScreen };
