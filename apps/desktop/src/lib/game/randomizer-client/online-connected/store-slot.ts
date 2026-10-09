/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { parseSlotData } from '@shared/randomizer/archipelago/parse-slot-data';
import type { ApConnectedPacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';

const storeSlot = (ctx: OnlineContext, packet: ApConnectedPacket): string | null => {
  const { room, names } = ctx;
  room.connected = true;
  room.team = packet.team;
  room.slot = packet.slot;
  room.players = Array.isArray(packet.players) ? packet.players : [];
  room.checked = new Set(packet.checked_locations ?? []);
  room.missing = new Set(packet.missing_locations ?? []);
  const parsed = parseSlotData(packet.slot_data);
  room.slotData = parsed.kind === 'ok' ? parsed.slotData : null;
  if (parsed.kind === 'malformed') log.randomizer('[Online] Slot data missing or not this world\'s shape', 'warn');
  names.setPlayers(room.players, packet.team);
  if (packet.slot_info) names.setSlotInfo(packet.slot_info);
  return parsed.kind === 'version' ? parsed.message : null;
};

export { storeSlot };
