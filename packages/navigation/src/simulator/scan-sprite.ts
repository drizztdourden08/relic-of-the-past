/* @layer bridge-wasm @kind logic */
import { wasmGetRoomSpriteSpawns, wasmGetEntranceRooms, wasmGetOverworldEntrances } from '@rotp/game-core';
import { LAST_ROOM } from './scan-sprite.constants';

const entrancesInto = (room: number, rooms: ArrayLike<number> | null, areas: ReadonlyMap<number, number>): string[] => {
  const enteredFrom: string[] = [];
  for (let id = 0; id < (rooms?.length ?? 0); id++) {
    if (rooms?.[id] === room) enteredFrom.push(`e${id}@ow:${(areas.get(id) ?? -1).toString(16)}`);
  }
  return enteredFrom;
};

const scanRoomsForSprite = (spriteType: number): Array<{ room: number; tiles: string; from: string }> => {
  const rooms = wasmGetEntranceRooms();
  const areas = new Map<number, number>();
  for (const e of wasmGetOverworldEntrances()) areas.set(e.id, e.area);
  const hits: Array<{ room: number; tiles: string; from: string }> = [];
  for (let room = 0; room <= LAST_ROOM; room++) {
    const at = (wasmGetRoomSpriteSpawns(room) ?? [])
      .filter((s) => s.spriteType === spriteType)
      .map((s) => `${s.row},${s.col}`);
    if (at.length === 0) continue;
    const enteredFrom = entrancesInto(room, rooms, areas);
    hits.push({ room, tiles: at.join(' '), from: enteredFrom.join(' ') || 'no entrance' });
  }
  return hits;
};

export { scanRoomsForSprite };
