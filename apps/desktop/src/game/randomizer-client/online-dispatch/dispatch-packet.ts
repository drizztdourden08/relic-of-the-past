/* @layer bridge-wasm @kind logic */
import { handleDataPackage, handleRoomInfo } from '../online-data-package';
import { handleConnected } from '../online-connected';
import { handleReceivedItems } from '../online-received';
import { handleLocationInfo } from '../online-scouted';
import { handlePrintJson, handleRoomUpdate } from '../online-messages';
import { refusalText } from '@rotp/randomizer';
import type { ApServerPacket } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import { handleInvalid } from './handle-invalid';
import type { BouncedHandler } from '@rotp/randomizer';

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

export { dispatchPacket };
