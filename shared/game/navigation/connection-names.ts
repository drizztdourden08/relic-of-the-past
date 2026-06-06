import { ALL_CONNECTIONS } from '../data/connections';
import { SCREEN_BY_ID } from '../data/screens';

/** fromRegionId → destination screen IDs (built once from the connection table). */
const connectionsByFrom = new Map<string, string[]>();
for (const conn of ALL_CONNECTIONS) {
  let list = connectionsByFrom.get(conn.from);
  if (!list) { list = []; connectionsByFrom.set(conn.from, list); }
  list.push(conn.to);
}

/**
 * Resolve the display name for a connection destination: given the current screen
 * and a target room index, find the matching connection's destination screen name.
 */
const getConnectionDestinationName = (currentScreenId: string, targetRoomId: number): string | null => {
  const destinations = connectionsByFrom.get(currentScreenId);
  if (!destinations) return null;
  for (const toId of destinations) {
    const screen = SCREEN_BY_ID.get(toId);
    if (screen && screen.roomIndex === targetRoomId) return screen.name;
  }
  return null;
};

export { getConnectionDestinationName };
