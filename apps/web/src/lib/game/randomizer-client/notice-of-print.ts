/* @layer bridge-wasm @kind logic */
/**
 * The notice a PrintJSON message raises, or null. Items are told from this player's side:
 * received from someone, sent to someone, found for ourselves, or passed between two other
 * players. A hint keeps the server's own line, its names drawn apart. Joins and parts of
 * trackers and text clients (this app's own tracker links among them) raise nothing, and
 * neither does anything this client said or did itself, except its own goal.
 */
import { isNonGameClient } from './network-presence';
import { itemPart, noticeOf, playerPart } from './online-notices';
import type { ApJsonMessagePart, ApPrintJsonPacket } from './ap-protocol.type';
import type { NameTables } from './ap-names';
import type { NoticePart, OnlineNotice } from './online-notices';

interface PrintSide {
  names: NameTables;
  /** This client's slot; null before Connected. */
  slot: number | null;
  team: number | null;
}

const TONE_OF_PART: Readonly<Record<string, NoticePart['tone']>> = {
  player_id: 'player', player_name: 'player', item_id: 'item', item_name: 'item',
};

const partOf = (part: ApJsonMessagePart, names: NameTables): NoticePart => {
  const text = part.text ?? '';
  const id = Number(text);
  const known = Number.isFinite(id) && text !== '';
  const tone = TONE_OF_PART[part.type ?? ''];
  if (part.type === 'player_id' && known) return playerPart(names.playerName(id));
  if (part.type === 'item_id' && known) return itemPart(names.itemName(id, part.player ?? 0));
  if (part.type === 'location_id' && known) return { text: names.locationName(id, part.player ?? 0) };
  return tone === undefined ? { text } : { text, tone };
};

const itemNotice = (packet: ApPrintJsonPacket, side: PrintSide): OnlineNotice | null => {
  const { item, receiving } = packet;
  if (item === undefined || typeof receiving !== 'number') return null;
  const { names, slot } = side;
  const name = itemPart(names.itemName(item.item, receiving));
  const finder = names.playerName(item.player);
  const receiver = names.playerName(receiving);
  if (receiving === slot && item.player === slot) return noticeOf('ownCheck', [{ text: 'You found your ' }, name]);
  if (receiving === slot) return noticeOf('itemReceived', [{ text: 'Received ' }, name, { text: ' from ' }, playerPart(finder)], finder);
  if (item.player === slot) return noticeOf('itemSent', [name, { text: ' sent to ' }, playerPart(receiver)], receiver);
  if (receiving === item.player) return noticeOf('otherCheck', [playerPart(finder), { text: ' found their ' }, name]);
  return noticeOf('otherCheck', [playerPart(finder), { text: ' sent ' }, name, { text: ' to ' }, playerPart(receiver)]);
};

const hintNotice = (packet: ApPrintJsonPacket, side: PrintSide): OnlineNotice | null => {
  if (!Array.isArray(packet.data)) return null;
  const ours = packet.receiving === side.slot || packet.item?.player === side.slot;
  return noticeOf(ours ? 'hintOwn' : 'hintOther', packet.data.map((part) => partOf(part, side.names)));
};

const slotNotice = (packet: ApPrintJsonPacket, side: PrintSide): OnlineNotice | null => {
  const { slot: from } = packet;
  if (typeof from !== 'number') return null;
  const own = from === side.slot;
  const who = playerPart(side.names.playerName(from));
  switch (packet.type) {
    case 'Goal':
      return noticeOf('goal', own ? [{ text: 'You completed your goal' }] : [who, { text: ' completed their goal' }]);
    case 'Release':
      return own ? null : noticeOf('release', [who, { text: ' released their remaining items' }]);
    case 'Collect':
      return own ? null : noticeOf('release', [who, { text: ' collected their remaining items' }]);
    case 'Join': {
      if (own || isNonGameClient(packet)) return null;
      const game = side.names.gameOf(from);
      return noticeOf('join', [who, { text: game ? ` joined, playing ${game}` : ' joined' }]);
    }
    case 'Part':
      return own || isNonGameClient(packet) ? null : noticeOf('join', [who, { text: ' left' }]);
    case 'Chat':
      return own || !packet.message ? null : noticeOf('chat', [who, { text: `: ${packet.message}` }]);
    default:
      return null;
  }
};

const isOtherTeam = (packet: ApPrintJsonPacket, side: PrintSide): boolean =>
  side.team !== null && typeof packet.team === 'number' && packet.team !== side.team;

const noticeOfPrint = (packet: ApPrintJsonPacket, side: PrintSide): OnlineNotice | null => {
  if (isOtherTeam(packet, side)) return null;
  switch (packet.type) {
    case 'ItemSend':
    case 'ItemCheat':
      return itemNotice(packet, side);
    case 'Hint':
      return hintNotice(packet, side);
    case 'ServerChat':
      return packet.message ? noticeOf('chat', [playerPart('Server'), { text: `: ${packet.message}` }]) : null;
    default:
      return slotNotice(packet, side);
  }
};

export { noticeOfPrint };
export type { PrintSide };
