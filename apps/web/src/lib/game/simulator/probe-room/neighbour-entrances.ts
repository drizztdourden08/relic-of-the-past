/* @layer bridge-wasm @kind logic */
import { NEIGHBOUR_ROOM_SPAN } from './probe-room.constants';
import type { RoomProbe } from './probe-room.type';

const neighbourEntrances = (roomId: number, rooms: ArrayLike<number> | null | undefined): RoomProbe['neighbourEntrances'] => {
  const out: RoomProbe['neighbourEntrances'] = [];
  for (let r = roomId - NEIGHBOUR_ROOM_SPAN; r <= roomId + NEIGHBOUR_ROOM_SPAN; r++) {
    const ids: number[] = [];
    for (let id = 0; id < (rooms?.length ?? 0); id++) if (rooms?.[id] === r) ids.push(id);
    if (ids.length > 0) out.push({ room: r, ids });
  }
  return out;
};

export { neighbourEntrances };
