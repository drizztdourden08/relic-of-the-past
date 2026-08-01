/* @layer shared-game @kind logic */
import { find, getScreen } from '../data';

/** fromScreenId → destination screen IDs (built once from the connection table). */
const connectionsByFrom = new Map<string, string[]>();
for (const conn of find('connection', () => true)) {
  let list = connectionsByFrom.get(conn.fromScreenId);
  if (!list) { list = []; connectionsByFrom.set(conn.fromScreenId, list); }
  list.push(conn.toScreenId);
}

/**
 * Resolve the display name for a connection destination: given the current screen
 * and a target room index, find the matching connection's destination screen name.
 */
const getConnectionDestinationName = (currentScreenId: string, targetRoomId: number): string | null => {
  const destinations = connectionsByFrom.get(currentScreenId);
  if (!destinations) return null;
  for (const toId of destinations) {
    const screen = getScreen(toId);
    const nativeIndex = screen.gameId.overworldIndex ?? screen.gameId.roomIndex;
    if (nativeIndex === targetRoomId) return screen.vanillaName ?? screen.randomizerName;
  }
  return null;
};

export { getConnectionDestinationName };
