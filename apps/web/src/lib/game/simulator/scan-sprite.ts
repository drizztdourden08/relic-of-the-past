/* @layer bridge-wasm @kind logic */
/**
 * Where does the game actually put a given sprite?
 *
 * A check's room index comes from our own data, and when that index is wrong the
 * failure is silent: the room exists, it just holds something else, so the check
 * never fires and nothing says why. Asking every room's spawn table which ones
 * hold the sprite settles it against the game rather than against the dataset.
 */
import { wasmGetRoomSpriteSpawns, wasmGetEntranceRooms, wasmGetOverworldEntrances } from '../';

/** Indoor room indices run 0x000-0x17F. */
const LAST_ROOM = 0x17f;

const scanRoomsForSprite = (spriteType: number): Array<{ room: number; tiles: string; from: string }> => {
  // Which overworld screen a room is entered from is what names it — a room index
  // alone cannot be checked against anything.
  const rooms = wasmGetEntranceRooms();
  const areas = new Map<number, number>();
  for (const e of wasmGetOverworldEntrances()) areas.set(e.id, e.area);
  const hits: Array<{ room: number; tiles: string; from: string }> = [];
  for (let room = 0; room <= LAST_ROOM; room++) {
    const at = (wasmGetRoomSpriteSpawns(room) ?? [])
      .filter((s) => s.spriteType === spriteType)
      .map((s) => `${s.row},${s.col}`);
    if (at.length === 0) continue;
    const from: string[] = [];
    for (let id = 0; id < (rooms?.length ?? 0); id++) {
      if (rooms?.[id] === room) from.push(`e${id}@ow:${(areas.get(id) ?? -1).toString(16)}`);
    }
    hits.push({ room, tiles: at.join(' '), from: from.join(' ') || 'no entrance' });
  }
  return hits;
};

export { scanRoomsForSprite };
