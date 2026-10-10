/* @layer shared-game @kind logic */
import { all, getScreen } from '../../../data';
import type { DungeonId } from '../../../data';
import type { RoomMaps } from './dungeon-group.type';
import { dungeonGroupOf } from './dungeon-group-of';

let cachedMaps: RoomMaps | null = null;

const buildRoomMaps = (): RoomMaps => {
  const groupByRoom = new Map<number, number>();
  const dungeonByRoom = new Map<number, DungeonId>();
  for (const dungeon of all('dungeon')) {
    for (const screenId of dungeon.roomScreenIds) {
      const { roomIndex, palaceIndex } = getScreen(screenId).gameId;
      if (roomIndex === undefined) continue;
      dungeonByRoom.set(roomIndex, dungeon.id);
      if (palaceIndex !== undefined) groupByRoom.set(roomIndex, dungeonGroupOf(palaceIndex));
    }
  }
  return { groupByRoom, dungeonByRoom };
};

const roomMaps = (): RoomMaps => {
  cachedMaps ??= buildRoomMaps();
  return cachedMaps;
};

export { roomMaps };
