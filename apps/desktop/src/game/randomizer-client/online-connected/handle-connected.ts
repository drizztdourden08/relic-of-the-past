/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { applySlotDeathLink } from '@rotp/randomizer';
import { bindSaveToRoom } from '@rotp/randomizer';
import type { ApConnectedPacket } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import { isKnownReported } from '@rotp/randomizer';
import { markRoomChecked } from '@rotp/randomizer';
import { scoutOnce } from './scout-once';
import { storeSlot } from './store-slot';

const handleConnected = (ctx: OnlineContext, packet: ApConnectedPacket): void => {
  const { room, core } = ctx;
  if (room.gameData === null) {
    ctx.fail('[Online] Connected before the data package arrived');
    return;
  }
  const versionRefusal = storeSlot(ctx, packet);
  if (versionRefusal !== null) {
    ctx.fail(`[Online] ${versionRefusal}`);
    return;
  }
  if (!bindSaveToRoom(ctx)) return;
  ctx.markConnected();
  applySlotDeathLink(ctx);
  ctx.goal.onConnected();
  const unsent = [...room.reportedLocal].filter((id) => !room.checked.has(id));
  if (unsent.length > 0) ctx.send({ cmd: 'LocationChecks', locations: unsent });
  scoutOnce(ctx);
  markRoomChecked(ctx, room.checked);
  core.startPolling(ctx.reporter, room.pollEntries, (key) => isKnownReported(ctx, key));
  log.randomizer(`[Online] Connected as ${ctx.config.slotName} (slot ${packet.slot}, team ${packet.team})`);
};

export { handleConnected };
