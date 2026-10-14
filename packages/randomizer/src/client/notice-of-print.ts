/* @layer bridge-wasm @kind logic */
import { isNonGameClient } from './network-presence';
import { itemPart, noticeOf, playerPart } from './online-notices';
import type { ApJsonMessagePart, ApPrintJsonPacket } from './ap-protocol.type';
import type { NameTables } from './ap-names';
import type { NoticePart, OnlineNotice } from './online-notices';
import { TONE_OF_PART } from './notice-of-print.constants';
import type { PrintSide, SlotContext } from './notice-of-print.type';

const typedPart = (part: ApJsonMessagePart, names: NameTables, id: number): NoticePart | null => {
  switch (part.type) {
    case 'player_id': return playerPart(names.playerName(id));
    case 'item_id': return itemPart(names.itemName(id, part.player ?? 0));
    case 'location_id': return { text: names.locationName(id, part.player ?? 0) };
    case undefined:
    default: return null;
  }
};

const partOf = (part: ApJsonMessagePart, names: NameTables): NoticePart => {
  const text = part.text ?? '';
  const id = Number(text);
  const typed = Number.isFinite(id) && text !== '' ? typedPart(part, names, id) : null;
  if (typed !== null) return typed;
  const tone = TONE_OF_PART[part.type ?? ''];
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

const joinNotice = (ctx: SlotContext): OnlineNotice | null => {
  const { packet, side, from, own, who } = ctx;
  if (own || isNonGameClient(packet)) return null;
  const game = side.names.gameOf(from);
  return noticeOf('join', [who, { text: game ? ` joined, playing ${game}` : ' joined' }]);
};

const partNotice = (ctx: SlotContext): OnlineNotice | null =>
  (ctx.own || isNonGameClient(ctx.packet) ? null : noticeOf('join', [ctx.who, { text: ' left' }]));

const chatNotice = (ctx: SlotContext): OnlineNotice | null =>
  (ctx.own || !ctx.packet.message ? null : noticeOf('chat', [ctx.who, { text: `: ${ctx.packet.message}` }]));

const goalNotice = (ctx: SlotContext): OnlineNotice =>
  noticeOf('goal', ctx.own ? [{ text: 'You completed your goal' }] : [ctx.who, { text: ' completed their goal' }]);

const releaseNotice = (ctx: SlotContext): OnlineNotice | null =>
  (ctx.own ? null : noticeOf('release', [ctx.who, { text: ' released their remaining items' }]));

const collectNotice = (ctx: SlotContext): OnlineNotice | null =>
  (ctx.own ? null : noticeOf('release', [ctx.who, { text: ' collected their remaining items' }]));

const slotNotice = (packet: ApPrintJsonPacket, side: PrintSide): OnlineNotice | null => {
  const { slot: from } = packet;
  if (typeof from !== 'number') return null;
  const own = from === side.slot;
  const who = playerPart(side.names.playerName(from));
  const ctx: SlotContext = { packet, side, from, own, who };
  switch (packet.type) {
    case 'Goal': return goalNotice(ctx);
    case 'Release': return releaseNotice(ctx);
    case 'Collect': return collectNotice(ctx);
    case 'Join': return joinNotice(ctx);
    case 'Part': return partNotice(ctx);
    case 'Chat': return chatNotice(ctx);
    case undefined:
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
    case undefined:
    default:
      return slotNotice(packet, side);
  }
};

export { noticeOfPrint };
export type { PrintSide } from './notice-of-print.type';
