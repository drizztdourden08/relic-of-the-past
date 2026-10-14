/* @layer shared-game @kind logic */
import { all } from '../../../data';
import type { ScreenRecord } from '../../../data';
import type { ScreenLookup } from './detection.type';

const indexByKind = (lookup: ScreenLookup, screen: ScreenRecord): void => {
  const { overworldIndex, roomIndex, palaceIndex } = screen.gameId;
  if (screen.kind === 'overworld' && overworldIndex !== undefined) {
    lookup.byOverworldScreen.set(overworldIndex, screen);
  } else if (screen.kind === 'dungeon' && roomIndex !== undefined && palaceIndex !== undefined) {
    lookup.byDungeonRoom.set(`${palaceIndex}:${roomIndex}`, screen);
  } else if (roomIndex !== undefined) {
    lookup.byCaveRoom.set(roomIndex, screen);
    let list = lookup.byCaveRoomAll.get(roomIndex);
    if (!list) { list = []; lookup.byCaveRoomAll.set(roomIndex, list); }
    list.push(screen);
  }
};

const indexScreen = (lookup: ScreenLookup, screen: ScreenRecord): void => {
  const { roomIndex, entranceId } = screen.gameId;
  if (roomIndex !== undefined && !lookup.byRoomAny.has(roomIndex)) lookup.byRoomAny.set(roomIndex, screen);
  indexByKind(lookup, screen);
  if (entranceId != null) lookup.byEntranceId.set(entranceId, [...(lookup.byEntranceId.get(entranceId) ?? []), screen]);
};

const buildScreenLookup = (screens: readonly ScreenRecord[] = all('screen')): ScreenLookup => {
  const lookup: ScreenLookup = {
    byOverworldScreen: new Map(),
    byDungeonRoom: new Map(),
    byCaveRoom: new Map(),
    byEntranceId: new Map(),
    byCaveRoomAll: new Map(),
    byRoomAny: new Map(),
  };
  for (const screen of screens) indexScreen(lookup, screen);
  return lookup;
};

export { buildScreenLookup };
