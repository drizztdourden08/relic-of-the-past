/* @layer shared-game @kind logic */
import { find, getScreen } from '@rotp/game-data';
import { toScreenIdOf } from '@rotp/game-data';

const destinationsByScreen = new Map<string, string[]>();
for (const conn of find('connection', () => true)) {
  let list = destinationsByScreen.get(conn.screenId);
  if (!list) { list = []; destinationsByScreen.set(conn.screenId, list); }
  list.push(toScreenIdOf(conn));
}

const getConnectionDestinationName = (currentScreenId: string, targetRoomId: number): string | null => {
  const destinations = destinationsByScreen.get(currentScreenId);
  if (!destinations) return null;
  for (const toId of destinations) {
    const screen = getScreen(toId);
    const nativeIndex = screen.gameId.overworldIndex ?? screen.gameId.roomIndex;
    if (nativeIndex === targetRoomId) return screen.name;
  }
  return null;
};

export { getConnectionDestinationName };
