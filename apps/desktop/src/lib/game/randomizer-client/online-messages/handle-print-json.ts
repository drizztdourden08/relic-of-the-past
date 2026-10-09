/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { renderPrintJson } from '../print-json';
import { PLAYERS_COMMAND } from '../network-roster';
import { isPlayersReply } from '../players-reply';
import { noticeOfPrint } from '../notice-of-print';
import { emitOnlineNotice } from '../online-notices';
import type { ApPrintJsonPacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';
import { kindOfPrint } from './kind-of-print';

const isOwnPlayersEcho = (ctx: OnlineContext, packet: ApPrintJsonPacket): boolean =>
  packet.type === 'Chat' && packet.slot === ctx.room.slot && packet.message === PLAYERS_COMMAND;

const handlePrintJson = (ctx: OnlineContext, packet: ApPrintJsonPacket): void => {
  if (isOwnPlayersEcho(ctx, packet)) return;
  const text = renderPrintJson(packet, ctx.names);
  if (!text) return;
  const isPlayersAnswer = packet.type === 'CommandResult' && isPlayersReply(text);
  if (!isPlayersAnswer) log.randomizer(`[AP] ${text}`);
  ctx.messages.push(kindOfPrint(packet.type), text);
  const notice = noticeOfPrint(packet, { names: ctx.names, slot: ctx.room.slot, team: ctx.room.team });
  if (notice !== null) emitOnlineNotice(notice);
};

export { handlePrintJson };
