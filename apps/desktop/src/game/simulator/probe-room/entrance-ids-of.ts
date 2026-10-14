/* @layer bridge-wasm @kind logic */
import type { EntranceRooms } from './probe-room.type';

const entranceIdsOf = (rooms: EntranceRooms, roomId: number): number[] => {
  const ids: number[] = [];
  for (let id = 0; id < (rooms?.length ?? 0); id++) if (rooms?.[id] === roomId) ids.push(id);
  return ids;
};

export { entranceIdsOf };
