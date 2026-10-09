/* @layer bridge-wasm @kind logic */
import { wasmGetEntranceRooms } from '../../';

let entranceRoomMemo: Set<number> | null = null;

const entranceRoomSet = (): Set<number> => {
  if (entranceRoomMemo) return entranceRoomMemo;
  const rooms = wasmGetEntranceRooms();
  const set = new Set<number>();
  for (let id = 0; id < (rooms?.length ?? 0); id++) {
    const room = rooms?.[id];
    if (room != null) set.add(room);
  }
  const tableLoaded = set.size > 0;
  if (tableLoaded) entranceRoomMemo = set;
  return set;
};

const bothAreEntranceRooms = (a: number, b: number): boolean => {
  const set = entranceRoomSet();
  return set.has(a) && set.has(b);
};

export { bothAreEntranceRooms };
