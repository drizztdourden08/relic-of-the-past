/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { setCapacityProfileFamily, setWalletJumpTable } from '../../capacity-profile';
import { setCapacityPlanJumps } from '../../capacity-plan';
import { setCapacityFixedLines } from '../../capacity-fixed-lines';
import type { CapacityLineMessages } from '../capacity-rung-messages';
import type { CapacitySessionPlan } from '@rotp/randomizer';

const armCapacityProfile = (plan: CapacitySessionPlan, tag: string, lines: CapacityLineMessages): void => {
  if (!plan.armed) {
    log.randomizer(`${tag} Capacity profile: every family on its native grid, core not armed`);
    return;
  }
  for (const arm of plan.families) setCapacityProfileFamily(arm);
  setWalletJumpTable(plan.walletTable);
  if (plan.progressive) {
    for (const ladder of plan.ladders) setCapacityPlanJumps(ladder.family, ladder.jumps, lines.rungMessageIdOf(ladder.family));
  } else {
    setCapacityFixedLines(lines.fixedLineMessages);
  }
  const custom = plan.families.filter((arm) => arm.custom)
    .map((arm) => `${arm.family} ${arm.startTier}..${arm.maxTier}`);
  log.randomizer(`${tag} Capacity profile armed: ${custom.join(', ')}${
     plan.walletTable.length > 0 ? `; wallet slots [${plan.walletTable.join(', ')}]` : ''}`);
};

export { armCapacityProfile };
