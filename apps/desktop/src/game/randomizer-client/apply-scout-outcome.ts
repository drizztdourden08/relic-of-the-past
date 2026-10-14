/* @layer bridge-wasm @kind logic */
import { isKnownReported, withGoal } from './online-connected';
import { releaseHeldReceived } from './online-received';
import type { OnlineContext } from '@rotp/randomizer';
import type { ScoutOutcome } from './apply-scout-outcome.type';

const applyScoutOutcome = (ctx: OnlineContext, outcome: ScoutOutcome): void => {
  const { room, core, reporter } = ctx;
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

export { applyScoutOutcome };
