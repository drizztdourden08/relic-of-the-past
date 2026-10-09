/* @layer bridge-wasm @kind logic */
import { markRoomChecked } from '../online-connected/mark-room-checked';
import type { ApRoomUpdatePacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';

const handleRoomUpdate = (ctx: OnlineContext, packet: ApRoomUpdatePacket): void => {
  const { room, names } = ctx;
  if (Array.isArray(packet.players)) {
    room.players = packet.players;
    names.setPlayers(packet.players, room.team ?? 0);
  }
  const checked = packet.checked_locations ?? [];
  for (const id of checked) {
    room.checked.add(id);
    room.missing.delete(id);
  }
  markRoomChecked(ctx, checked);
};

export { handleRoomUpdate };
