/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { armReceiptGates } from '../receipt-grants';
import { armDungeonItemGrants } from '../dungeon-item-grants';
import { applyGearIcons } from '../gear-icons';
import { applyQuiverIcon } from '../quiver-icon';
import { applyCurrencySymbols } from '../currency-symbols';
import { buildPhysicalPlan } from '@rotp/randomizer';
import { withForeignIcons } from '@rotp/randomizer';
import { logPlanSummary } from './plan-summary-log';
import { startSessionReceiptTexts } from './receipt-text-refresh';
import { applyOverrides, pollEntriesOf } from './apply-overrides';
import {
  armCapacitySession, capacitySessionOf, disarmCapacitySession, primeCapacitySession,
} from './capacity-session';
import { pondSessionOf } from '@rotp/randomizer';
import { armPondSession } from './arm-pond-session';
import { disarmPondSession } from './disarm-pond-session';
import { armItemBehavior, disarmItemBehavior, itemBehaviorOf } from './item-behavior-session';
import { allocateFireId, armFireReporting } from './override-fire-registry';
import { armWishPondSession } from './wish-pond-session';
import { resolveLocalItemId } from '@rotp/randomizer';
import { armPondDemandSession } from './pond-demand-session';
import { pondDemandSessionOf } from '@rotp/randomizer';
import { wishPondSessionOf } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { PhysicalPlan } from '@rotp/randomizer';
import type { SessionArmResult, SessionStartHooks } from '@rotp/randomizer';

const refuseSession = (plan: PhysicalPlan, tag: string): SessionArmResult => {
  log.randomizer(`${tag} Session refused: ${plan.errors.length} plan errors (see above)`, 'error');
  log.randomizer(`${tag} NO overrides were applied. The game is running UNRANDOMIZED: `
    + 'every location gives its vanilla item until the profile is recreated.', 'error');
  disarmPondSession();
  disarmCapacitySession();
  disarmItemBehavior();
  return { ok: false, plan };
};

const armSessionFromPlacement = async (
  placement: Placement, tag: string, hooks: SessionStartHooks,
): Promise<SessionArmResult> => {
  const { stats } = placement;
  const capacity = capacitySessionOf(stats.capacity, stats.capacityProgressive, stats.capacityBonus);
  primeCapacitySession(capacity);
  armItemBehavior(itemBehaviorOf(placement.stats), tag);
  const plan = withForeignIcons(buildPhysicalPlan(placement), hooks.foreignIconIdOf);
  logPlanSummary(plan, tag);
  if (plan.errors.length > 0) return refuseSession(plan, tag);
  const receiptTexts = startSessionReceiptTexts(plan, placement, tag, hooks.foreignItemOf);
  const { messageIdOf } = receiptTexts;
  if (receiptTexts.composed) {
    log.randomizer(`${tag} Receipt text: contextual message lines composed and armed, following the tracker`);
  } else {
    log.randomizer(`${tag} Receipt text: session dialogue unavailable, baked class templates in use`, 'warn');
  }
  armReceiptGates();
  armDungeonItemGrants();
  await armCapacitySession(capacity, tag, receiptTexts);
  await applyGearIcons(tag);
  await applyQuiverIcon(tag);
  await applyCurrencySymbols(tag);
  armPondSession(pondSessionOf(placement, receiptTexts.pondMessages), tag);
  armFireReporting(hooks.reporter);
  applyOverrides(plan, messageIdOf, tag);
  armWishPondSession(wishPondSessionOf(placement, plan, { messageIdOf, fireIdOf: allocateFireId, lines: receiptTexts.wishPondMessages }), tag);
  armPondDemandSession(pondDemandSessionOf(placement, resolveLocalItemId, receiptTexts.pondDemandMessagesOf), tag);
  return { ok: true, plan, receiptTexts, messageIdOf, pollEntries: pollEntriesOf(plan, tag) };
};

export { armSessionFromPlacement };
export type { SessionArmResult, SessionStartHooks } from '@rotp/randomizer';
