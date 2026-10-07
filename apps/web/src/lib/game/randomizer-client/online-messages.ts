/* @layer bridge-wasm @kind logic */
/**
 * PrintJSON and RoomUpdate. A message is rendered with the room's names (print-json.ts),
 * logged under `[AP]`, kept in the session's message log and told as an online notice
 * (notice-of-print.ts); this client's own `!players`
 * is dropped, and the answer to it only kept in the message log. A room update merges the
 * newly checked locations and the renamed players into what Connected stored; a location
 * checked there (a `!collect` among them) shows done and is never reported again.
 */
import { log } from '../../log-bus';
import { renderPrintJson } from './print-json';
import { markRoomChecked } from './online-connected';
import { PLAYERS_COMMAND } from './network-roster';
import { isPlayersReply } from './players-reply';
import { noticeOfPrint } from './notice-of-print';
import { emitOnlineNotice } from './online-notices';
import type { ApPrintJsonPacket, ApRoomUpdatePacket } from './ap-protocol.type';
import type { RoomMessageKind } from './message-log';
import type { OnlineContext } from './online-context.type';

const KIND_OF_TYPE: Readonly<Record<string, RoomMessageKind>> = {
  ItemSend: 'item',
  ItemCheat: 'item',
  Hint: 'hint',
  Chat: 'chat',
  ServerChat: 'chat',
  Join: 'join',
  Part: 'join',
};

const kindOfPrint = (type: string | undefined): RoomMessageKind => KIND_OF_TYPE[type ?? ''] ?? 'server';

/** The room's echo of the `!players` this client sends on each connect (network-roster.ts). */
const isOwnPlayersEcho = (ctx: OnlineContext, packet: ApPrintJsonPacket): boolean =>
  packet.type === 'Chat' && packet.slot === ctx.room.slot && packet.message === PLAYERS_COMMAND;

const handlePrintJson = (ctx: OnlineContext, packet: ApPrintJsonPacket): void => {
  if (isOwnPlayersEcho(ctx, packet)) return;
  const text = renderPrintJson(packet, ctx.names);
  if (!text) return;
  // The `!players` answer comes on every connect: the room feed keeps it, the log does not.
  if (!(packet.type === 'CommandResult' && isPlayersReply(text))) log.randomizer(`[AP] ${text}`);
  ctx.messages.push(kindOfPrint(packet.type), text);
  const notice = noticeOfPrint(packet, { names: ctx.names, slot: ctx.room.slot, team: ctx.room.team });
  if (notice !== null) emitOnlineNotice(notice);
};

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

export { handlePrintJson, handleRoomUpdate, kindOfPrint };
