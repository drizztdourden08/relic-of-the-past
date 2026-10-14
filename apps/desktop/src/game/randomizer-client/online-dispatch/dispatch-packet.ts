/* @layer bridge-wasm @kind logic */
import type { ApServerPacket, OnlineContext, BouncedHandler } from '@rotp/randomizer';
import { PACKET_HANDLERS } from './packet-handlers.constants';

const dispatchPacket = (ctx: OnlineContext, packet: ApServerPacket, onBounced: BouncedHandler): void => {
  PACKET_HANDLERS[packet.cmd]?.(ctx, packet, onBounced);
};

export { dispatchPacket };
