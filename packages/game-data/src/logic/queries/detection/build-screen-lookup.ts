/* @layer shared-game @kind logic */
import { all } from '../../../data';
import type { ScreenRecord } from '../../../data';
import type { ScreenLookup } from './detection.type';

const buildScreenLookup = (screens: readonly ScreenRecord[] = all('screen')): ScreenLookup => {
  const byOverworldScreen = new Map<number, ScreenRecord>();
  const byDungeonRoom = new Map<string, ScreenRecord>();
  const byCaveRoom = new Map<number, ScreenRecord>();
  const byEntranceId = new Map<number, ScreenRecord[]>();
  const byCaveRoomAll = new Map<number, ScreenRecord[]>();
  const byRoomAny = new Map<number, ScreenRecord>();

  for (const screen of screens) {
    const { overworldIndex, roomIndex, palaceIndex, entranceId } = screen.gameId;
    if (roomIndex !== undefined && !byRoomAny.has(roomIndex)) byRoomAny.set(roomIndex, screen);

    if (screen.kind === 'overworld' && overworldIndex !== undefined) {
      byOverworldScreen.set(overworldIndex, screen);
    } else if (screen.kind === 'dungeon' && roomIndex !== undefined && palaceIndex !== undefined) {
      byDungeonRoom.set(`${palaceIndex}:${roomIndex}`, screen);
    } else if (roomIndex !== undefined) {
      byCaveRoom.set(roomIndex, screen);
      let list = byCaveRoomAll.get(roomIndex);
      if (!list) { list = []; byCaveRoomAll.set(roomIndex, list); }
      list.push(screen);
    }

    if (entranceId != null) byEntranceId.set(entranceId, [...(byEntranceId.get(entranceId) ?? []), screen]);
  }

  return { byOverworldScreen, byDungeonRoom, byCaveRoom, byEntranceId, byCaveRoomAll, byRoomAny };
};

export { buildScreenLookup };
