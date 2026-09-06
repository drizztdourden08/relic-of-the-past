/* @layer bridge-wasm @kind logic */
/**
 * Capacity arming for a session — translates the profile a placement was
 * generated with into the exact core writes: one WasmSetCapacityProfile per
 * family (custom flag, start and final tier indices) and the wallet jump
 * table (sorted distinct jumps of the wallet plan, slot = position), plus the
 * host copy of that table the item resolver reads. The translation is pure
 * (capacitySessionOf) so a test can pin it without a module; the arming and
 * the disarm are the only impure steps. A profile with no Custom family arms
 * nothing: every family stays on its native grid and the gate bit stays down,
 * so a vanilla or reference seed leaves the core exactly as it found it. A
 * progressive session additionally arms every Custom family's jump sequence
 * (capacity-plan.ts) with the message id of each rung's pre-rendered line,
 * so the core can climb the plan in order and show the jump it applied; a
 * fixed-jump session writes exactly what it always did.
 */

import {
  FAMILIES, LEGACY_CAPACITY_BONUS, WALLET, maxTierOf, planOf, startTierOf,
} from '@shared/randomizer/ap-world/capacity';
import { walletJumpTableOf } from '@shared/game/data';
import { log } from '../../log-bus';
import {
  clearCapacityProfile, openCapacityGate, setCapacityProfileFamily, setWalletJumpTable,
} from '../capacity-profile';
import { clearCapacityBonus, setCapacityBonus } from '../capacity-bonus';
import { clearCapacityPlan, setCapacityPlanJumps } from '../capacity-plan';
import { clearCapacityFixedLines, setCapacityFixedLines } from '../capacity-fixed-lines';
import { applyUpgradeIcons, clearUpgradeIcons } from '../upgrade-icons';
import { clearSessionWalletTable, setSessionWalletTable } from './session-wallet-table';
import { NO_CAPACITY_LINES } from './capacity-rung-messages';
import type { CapacityBonusSetting, CapacityFamilyId, CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { CapacityFamilyArm } from '../capacity-profile';
import type { CapacityLineMessages } from './capacity-rung-messages';

/** One Custom family's planned jumps, in plan order — what a progressive pickup climbs by. */
interface CapacityLadderArm {
  family: CapacityFamilyId;
  jumps: readonly number[];
}

interface CapacitySessionPlan {
  profile: CapacityProfile;
  /** One arm per family, in the core's family order. */
  families: readonly CapacityFamilyArm[];
  /** Slot → rungs; [] when the wallet stays vanilla. */
  walletTable: readonly number[];
  /** True when at least one family is Custom — the only case the core is armed. */
  armed: boolean;
  /** The Custom families' jump sequences; written to the core only under `progressive`. */
  ladders: readonly CapacityLadderArm[];
  /** Pickups climb the plan in order (one progressive item per family). */
  progressive: boolean;
  /** What a pickup hands over beside its ceiling, per family. */
  bonus: CapacityBonusSetting;
  /**
   * True when some family hands out upgrade items at all (Custom or in pool),
   * which is the only case a pickup can pay the bonus; every family Vanilla
   * leaves the core untouched.
   */
  bonusArmed: boolean;
}

const capacitySessionOf = (
  profile: CapacityProfile, progressive = false, bonus: CapacityBonusSetting = LEGACY_CAPACITY_BONUS,
): CapacitySessionPlan => {
  const families = FAMILIES.map((family): CapacityFamilyArm => {
    const setting = profile[family.id];
    return {
      family: family.id,
      custom: setting.mode === 'custom',
      startTier: startTierOf(family, setting),
      maxTier: maxTierOf(family, setting),
    };
  });
  const walletTable = walletJumpTableOf(planOf(WALLET, profile.wallet).jumps);
  const ladders = FAMILIES.flatMap((capacityFamily): CapacityLadderArm[] => {
    const setting = profile[capacityFamily.id];
    return setting.mode === 'custom' ? [{ family: capacityFamily.id, jumps: planOf(capacityFamily, setting).jumps }] : [];
  });
  const bonusArmed = FAMILIES.some((family) => profile[family.id].mode !== 'vanilla');
  return {
    profile, families, walletTable, armed: families.some((arm) => arm.custom), ladders, progressive, bonus, bonusArmed,
  };
};

/** Host side only: the wallet table the item resolver needs before the plan is built. */
const primeCapacitySession = (plan: CapacitySessionPlan): void => {
  setSessionWalletTable(plan.walletTable);
};

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
  log.randomizer(`${tag} Capacity profile armed: ${custom.join(', ')}`
    + (plan.walletTable.length > 0 ? `; wallet slots [${plan.walletTable.join(', ')}]` : ''));
};

const armCapacitySession = async (
  plan: CapacitySessionPlan, tag: string, lines: CapacityLineMessages = NO_CAPACITY_LINES,
): Promise<void> => {
  primeCapacitySession(plan);
  armCapacityProfile(plan, tag, lines);
  // The pickup bonus answers to a virtual grant, which an in-pool family hands out even
  // with no Custom family armed, so it follows the pool rather than the profile.
  if (plan.bonusArmed) setCapacityBonus(plan.bonus);
  // The hold-up icons answer to the same gate. A session whose families all stay on
  // the native grid raises it for them alone: nothing is armed in the core, so every
  // profile seam keeps its native answer.
  if (await applyUpgradeIcons(tag) && !plan.armed) openCapacityGate();
};

const disarmCapacitySession = (): void => {
  clearSessionWalletTable();
  clearUpgradeIcons();
  clearCapacityPlan();
  clearCapacityFixedLines();
  clearCapacityProfile();
  clearCapacityBonus();
};

export { armCapacitySession, capacitySessionOf, disarmCapacitySession, primeCapacitySession };
export type { CapacityLadderArm, CapacitySessionPlan };
