/* @layer bridge-wasm @kind logic */
import { openCapacityGate } from '../../capacity-profile';
import { setCapacityBonus } from '../../capacity-bonus';
import { applyUpgradeIcons } from '../../upgrade-icons';
import { setActiveCapacity } from '@rotp/randomizer';
import { NO_CAPACITY_LINES } from '@rotp/randomizer';
import type { CapacityLineMessages } from '../capacity-rung-messages';
import { armCapacityProfile } from './arm-capacity-profile';
import type { CapacitySessionPlan } from '@rotp/randomizer';
import { primeCapacitySession } from '@rotp/randomizer';

const armCapacitySession = async (
  plan: CapacitySessionPlan, tag: string, lines: CapacityLineMessages = NO_CAPACITY_LINES,
): Promise<void> => {
  primeCapacitySession(plan);
  setActiveCapacity({ profile: plan.profile, progressive: plan.progressive });
  armCapacityProfile(plan, tag, lines);
  if (plan.bonusArmed) setCapacityBonus(plan.bonus);
  const iconsApplied = await applyUpgradeIcons(tag);
  const iconsNeedTheirOwnGate = iconsApplied && !plan.armed;
  if (iconsNeedTheirOwnGate) openCapacityGate();
};

export { armCapacitySession };
