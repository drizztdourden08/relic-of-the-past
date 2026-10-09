/* @layer bridge-wasm @kind logic */
import { parseServerPackets } from '../online-handshake';
import type { NetworkMonitor } from '../network-monitor';
import type { OnlineContext } from '../online-context.type';
import { dispatchPacket } from './dispatch-packet';
import type { BouncedHandler } from './online-dispatch.type';

const dispatchMessage = (
  ctx: OnlineContext, data: string, network: Pick<NetworkMonitor, 'received' | 'changed'>, onBounced: BouncedHandler,
): void => {
  for (const packet of parseServerPackets(data)) {
    if (!network.received(packet)) dispatchPacket(ctx, packet, onBounced);
  }
  network.changed();
};

export { dispatchMessage };
