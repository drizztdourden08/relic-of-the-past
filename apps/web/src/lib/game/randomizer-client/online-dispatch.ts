/* @layer bridge-wasm @kind logic */
/**
 * Routes each server packet to its handler. Commands this client has no use for are ignored.
 * A socket message passes the network monitor packet by packet first (network-monitor.ts).
 */
import { log } from '../../log-bus';
import { handleDataPackage, handleRoomInfo } from './online-data-package';
import { handleConnected } from './online-connected';
import { handleReceivedItems } from './online-received';
import { handleLocationInfo } from './online-scouted';
import { handlePrintJson, handleRoomUpdate } from './online-messages';
import { parseServerPackets } from './online-handshake';
import { refusalText } from './refusal-text';
import type { ApBouncedPacket, ApInvalidPacket, ApServerPacket } from './ap-protocol.type';
import type { NetworkMonitor } from './network-monitor';
import type { OnlineContext } from './online-context.type';

type BouncedHandler = (packet: ApBouncedPacket) => void;

const handleInvalid = (ctx: OnlineContext, packet: ApInvalidPacket): void => {
  log.randomizer(`[Online] Server refused a ${packet.original_cmd ?? 'packet'}: ${packet.text}`, 'warn');
  // A refused scout never answers, and the session is armed from the scouts alone, so
  // nothing could set the game up: the session ends, as a local seed with no plan does.
  if (packet.original_cmd === 'LocationScouts' && !ctx.room.scouted) {
    ctx.fail('[Online] Session refused: the server would not say what the locations hold');
  }
};

const dispatchPacket = (ctx: OnlineContext, packet: ApServerPacket, onBounced: BouncedHandler): void => {
  switch (packet.cmd) {
    case 'RoomInfo':
      handleRoomInfo(ctx, packet);
      break;
    case 'DataPackage':
      handleDataPackage(ctx, packet);
      break;
    case 'Connected':
      handleConnected(ctx, packet);
      break;
    case 'ConnectionRefused': {
      const codes = packet.errors ?? [];
      const text = refusalText(codes, ctx.config.slotName);
      ctx.fail(`[Online] ${text}`, `[Online] Connection refused (${codes.join(', ') || 'no reason'}): ${text}`);
      break;
    }
    case 'ReceivedItems':
      handleReceivedItems(ctx, packet);
      break;
    case 'LocationInfo':
      void handleLocationInfo(ctx, packet);
      break;
    case 'RoomUpdate':
      handleRoomUpdate(ctx, packet);
      break;
    case 'PrintJSON':
      handlePrintJson(ctx, packet);
      break;
    case 'Bounced':
      onBounced(packet);
      break;
    case 'InvalidPacket':
      handleInvalid(ctx, packet);
      break;
    default:
      break;
  }
};

/** One socket message: every packet it carries, then one change for the monitor's listeners. */
const dispatchMessage = (
  ctx: OnlineContext, data: string, network: Pick<NetworkMonitor, 'received' | 'changed'>, onBounced: BouncedHandler,
): void => {
  for (const packet of parseServerPackets(data)) {
    if (!network.received(packet)) dispatchPacket(ctx, packet, onBounced);
  }
  network.changed();
};

export { dispatchMessage, dispatchPacket };
export type { BouncedHandler };
