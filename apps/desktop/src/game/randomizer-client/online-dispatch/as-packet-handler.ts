/* @layer bridge-wasm @kind logic */
import type { ApServerPacket, BouncedHandler, OnlineContext } from '@rotp/randomizer';
import type { PacketHandler } from './online-dispatch.type';

const asPacketHandler = <P extends ApServerPacket>(
  handler: (ctx: OnlineContext, packet: P, onBounced: BouncedHandler) => void,
): PacketHandler => handler as PacketHandler;

export { asPacketHandler };
