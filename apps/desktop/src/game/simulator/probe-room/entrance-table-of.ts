/* @layer bridge-wasm @kind logic */
import type { RoomProbe } from '@rotp/navigation';
import type { EntranceRooms } from './probe-room.type';

const entranceTableOf = (rooms: EntranceRooms): RoomProbe['entranceTable'] => ({
  size: rooms?.length ?? 0,
  rooms: Array.from(rooms ?? []).map((r, i) => `${i}:${r.toString(16)}`).join(' '),
});

export { entranceTableOf };
