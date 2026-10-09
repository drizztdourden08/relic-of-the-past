/* @layer bridge-wasm @kind logic */
import { parseServerPackets } from '@rotp/randomizer';
import type { NetworkMonitor } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import { dispatchPacket } from './dispatch-packet';
import type { BouncedHandler } from '@rotp/randomizer';

const dispatchMessage = (
  ctx: OnlineContext, data: string, network: Pick<NetworkMonitor, 'received' | 'changed'>, onBounced: BouncedHandler,
): void => {
  for (const packet of parseServerPackets(data)) {
    if (!network.received(packet)) dispatchPacket(ctx, packet, onBounced);
  }
  network.changed();
};

export { dispatchMessage };
