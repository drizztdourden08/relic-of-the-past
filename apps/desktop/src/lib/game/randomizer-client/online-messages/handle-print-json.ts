/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { renderPrintJson } from '@rotp/randomizer';
import { PLAYERS_COMMAND } from '@rotp/randomizer';
import { isPlayersReply } from '@rotp/randomizer';
import { noticeOfPrint } from '@rotp/randomizer';
import { emitOnlineNotice } from '@rotp/randomizer';
import type { ApPrintJsonPacket } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import { kindOfPrint } from '@rotp/randomizer';

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
