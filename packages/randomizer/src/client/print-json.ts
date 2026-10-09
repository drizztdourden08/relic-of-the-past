/* @layer bridge-wasm @kind logic */
import type { ApJsonMessagePart, ApPrintJsonPacket } from './ap-protocol.type';
import type { NameTables } from './ap-names';

const partText = (part: ApJsonMessagePart, names: NameTables): string => {
  const text = part.text ?? '';
  const id = Number(text);
  const owner = part.player ?? 0;
  switch (part.type) {
    case 'player_id':
      return Number.isFinite(id) ? names.playerName(id) : text;
    case 'item_id':
      return Number.isFinite(id) ? names.itemName(id, owner) : text;
    case 'location_id':
      return Number.isFinite(id) ? names.locationName(id, owner) : text;
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
