/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import type { PlanCounts } from '@rotp/randomizer';

const logLocalArmed = (counts: PlanCounts): void => {
  log.randomizer(`[Local] Session armed: ${counts.override} chest + ${counts.overrideNpc} npc `
    + `+ ${counts.overrideDrop} drop + ${counts.overrideStanding} standing overrides applied, `
    + `${counts.deliver} deliver checks, ${counts.vanillaLocked} vanilla-locked`);
};

export { logLocalArmed };
