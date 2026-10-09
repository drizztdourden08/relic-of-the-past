/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { applySlotDeathLink } from '../slot-death-link';
import { bindSaveToRoom } from '../online-room-identity';
import type { ApConnectedPacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';
import { isKnownReported } from './is-known-reported';
import { markRoomChecked } from './mark-room-checked';
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
