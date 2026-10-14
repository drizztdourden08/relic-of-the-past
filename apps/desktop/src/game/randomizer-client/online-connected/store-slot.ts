/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { parseSlotData } from '@rotp/randomizer';
import { wireList } from '../wire-list';
import type { ApConnectedPacket, OnlineContext } from '@rotp/randomizer';

const storeSlot = (ctx: OnlineContext, packet: ApConnectedPacket): string | null => {
  const { room, names } = ctx;
  room.connected = true;
  room.team = packet.team;
  room.slot = packet.slot;
  room.players = Array.isArray(packet.players) ? packet.players : [];
  room.checked = new Set(wireList(packet.checked_locations));
  room.missing = new Set(wireList(packet.missing_locations));
  const parsed = parseSlotData(packet.slot_data);
  room.slotData = parsed.kind === 'ok' ? parsed.slotData : null;
  if (parsed.kind === 'malformed') log.randomizer('[Online] Slot data missing or not this world\'s shape', 'warn');
  names.setPlayers(room.players, packet.team);
  if (packet.slot_info) names.setSlotInfo(packet.slot_info);
  return parsed.kind === 'version' ? parsed.message : null;
};

export { storeSlot };
