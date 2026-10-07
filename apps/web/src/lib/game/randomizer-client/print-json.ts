/* @layer bridge-wasm @kind logic */
/**
 * Renders a PrintJSON message to plain text. Id parts become names through the room's
 * tables: a player id is a slot, an item id belongs to the game of the slot in its
 * `player` field (the item's owner), a location id to the game of its finder.
 */
import type { ApJsonMessagePart, ApPrintJsonPacket } from './ap-protocol.type';
import type { NameTables } from './ap-names';

const partText = (part: ApJsonMessagePart, names: NameTables): string => {
  const text = part.text ?? '';
  const id = Number(text);
  const player = part.player ?? 0;
  switch (part.type) {
    case 'player_id':
      return Number.isFinite(id) ? names.playerName(id) : text;
    case 'item_id':
      return Number.isFinite(id) ? names.itemName(id, player) : text;
    case 'location_id':
      return Number.isFinite(id) ? names.locationName(id, player) : text;
    default:
      return text;
  }
};

const renderPrintJson = (packet: ApPrintJsonPacket, names: NameTables): string => {
  const { data } = packet;
  if (!Array.isArray(data)) return packet.message ?? '';
  return data.map((part) => partText(part, names)).join('');
};

export { renderPrintJson };
