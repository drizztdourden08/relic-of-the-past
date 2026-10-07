/* @layer bridge-wasm @kind logic */
/**
 * LocationInfo, the scout answer: the game arms the session over the placement the scouts
 * become, polling switches to that plan's own entries, and the received items held until
 * now run. A session stopped while it armed disarms again, and a placement the plan refuses
 * ends the session the way a local seed with plan errors does.
 */
import { isKnownReported, withGoal } from './online-connected';
import { releaseHeldReceived } from './online-received';
import type { ApLocationInfoPacket } from './ap-protocol.type';
import type { OnlineContext } from './online-context.type';

const handleLocationInfo = async (ctx: OnlineContext, packet: ApLocationInfoPacket): Promise<void> => {
  const { room, core, maps, names, reporter } = ctx;
  if (room.scouted || room.scoutArming) return;
  room.scoutArming = true;
  const outcome = await core.armScouted({
    scouts: packet.locations ?? [],
    maps,
    slot: room.slot ?? 0,
    slotData: room.slotData,
    seedName: room.roomInfo?.seed_name,
    playerName: (slot) => names.playerName(slot),
    itemName: (itemId, ownerSlot) => names.itemName(itemId, ownerSlot),
    gameOf: (slot) => names.gameOf(slot),
    reporter,
  }).finally(() => { room.scoutArming = false; });
  if (!ctx.isLive()) {
    core.disarm();
    return;
  }
  if (!outcome.ok) {
    ctx.fail(`[Online] Session refused: ${outcome.reason}`);
    return;
  }
  if (outcome.placement !== null) ctx.setPlacement(outcome.placement, outcome.foreignOwners);
  if (outcome.pollEntries !== null) {
    room.pollEntries = withGoal(outcome.pollEntries, core.goalEntry());
    if (room.connected) core.startPolling(reporter, room.pollEntries, (key) => isKnownReported(ctx, key));
  }
  releaseHeldReceived(ctx);
};

export { handleLocationInfo };
