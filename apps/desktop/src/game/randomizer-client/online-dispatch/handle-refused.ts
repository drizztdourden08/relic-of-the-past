/* @layer bridge-wasm @kind logic */
import { refusalText } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import { wireList } from '../wire-list';
import type { PacketOf } from './online-dispatch.type';

const handleRefused = (ctx: OnlineContext, packet: PacketOf<'ConnectionRefused'>): void => {
  const codes = wireList(packet.errors);
  const text = refusalText(codes, ctx.config.slotName);
  ctx.fail(`[Online] ${text}`, `[Online] Connection refused (${codes.join(', ') || 'no reason'}): ${text}`);
};

export { handleRefused };
