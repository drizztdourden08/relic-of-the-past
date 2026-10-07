/* @layer bridge-wasm @kind logic */
/**
 * The one start sequence of a randomizer session, whatever produced its placement: a local
 * seed (local-session.ts) or a server's scouts (online-scouted.ts). Classifies the placement
 * into the physical plan, refuses loudly when the plan carries errors, and otherwise arms
 * everything in-core in the order the core needs it. Polling is the caller's: a local session
 * adopts what the save shows, an online one reports what its server lacks.
 */
import { log } from '../../log-bus';
import { armReceiptGates } from '../receipt-grants';
import { armDungeonItemGrants } from '../dungeon-item-grants';
import { applyGearIcons } from '../gear-icons';
import { applyQuiverIcon } from '../quiver-icon';
import { applyCurrencySymbols } from '../currency-symbols';
import { buildPhysicalPlan } from './placement-bridge';
import { withForeignIcons } from './foreign-icon-plan';
import { logPlanSummary } from './plan-summary-log';
import { startSessionReceiptTexts } from './receipt-text-refresh';
import { applyOverrides, pollEntriesOf } from './apply-overrides';
import {
  armCapacitySession, capacitySessionOf, disarmCapacitySession, primeCapacitySession,
} from './capacity-session';
import { armPondSession, disarmPondSession, pondSessionOf } from './pond-session';
import { armItemBehavior, disarmItemBehavior, itemBehaviorOf } from './item-behavior-session';
import { allocateFireId, armFireReporting } from './override-fire-registry';
import { armWishPondSession } from './wish-pond-session';
import { resolveLocalItemId } from './item-lookup';
import { armPondDemandSession } from './pond-demand-session';
import { pondDemandSessionOf } from './pond-demand-rows';
import { wishPondSessionOf } from './wish-pond-rungs';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { MessageIdOf } from './apply-overrides';
import type { ForeignItemOf } from './foreign-item-line';
import type { ForeignIconIdOf } from './foreign-icon-plan';
import type { PollEntry } from './location-poller';
import type { PhysicalPlan } from './physical-plan.type';
import type { SessionReceiptTexts } from './receipt-text-refresh';

interface SessionStartHooks {
  /** Where a substitution the core reports goes: the session's own reportCheck. */
  reporter: { reportCheck(location: LocationKey): void };
  /** Online only: each foreign item's name and owner, for its receipt line. */
  foreignItemOf?: ForeignItemOf;
  /** Online only: the icon id each foreign item is armed as, for its hold-up picture. */
  foreignIconIdOf?: ForeignIconIdOf;
}

type SessionArmResult =
  | { ok: false; plan: PhysicalPlan }
  | { ok: true; plan: PhysicalPlan; receiptTexts: SessionReceiptTexts; messageIdOf: MessageIdOf; pollEntries: PollEntry[] };

const armSessionFromPlacement = async (
  placement: Placement, tag: string, hooks: SessionStartHooks,
): Promise<SessionArmResult> => {
  // The persisted placement carries the profile it was generated with; its wallet
  // table must exist before the plan resolves the wallet item names.
  const { stats } = placement;
  const capacity = capacitySessionOf(stats.capacity, stats.capacityProgressive, stats.capacityBonus);
  primeCapacitySession(capacity);
  // Which rungs of each tiered family exist, and how helpful the items are.
  // Armed before the plan resolves anything: a progressive copy's presentation
  // is read off the ladder, so the ladder has to be the seed's own first.
  armItemBehavior(itemBehaviorOf(placement.stats), tag);
  const plan = withForeignIcons(buildPhysicalPlan(placement), hooks.foreignIconIdOf);
  logPlanSummary(plan, tag);
  if (plan.errors.length > 0) {
    log.randomizer(`${tag} Session refused: ${plan.errors.length} plan errors (see above)`, 'error');
    log.randomizer(`${tag} NO overrides were applied. The game is running UNRANDOMIZED: `
      + 'every location gives its vanilla item until the profile is recreated.', 'error');
    disarmPondSession();
    disarmCapacitySession();
    disarmItemBehavior();
    return { ok: false, plan };
  }
  // Pre-render every planned grant's contextual line from the frozen placement and
  // the tracker's counts, and push the composed session dialogue into the core
  // BEFORE the overrides arm, so the very first chest already carries its exact
  // per-event message id. The lines follow the tracker from here on.
  const receiptTexts = startSessionReceiptTexts(plan, placement, tag, hooks.foreignItemOf);
  const { messageIdOf } = receiptTexts;
  if (receiptTexts.composed) {
    log.randomizer(`${tag} Receipt text: contextual message lines composed and armed, following the tracker`);
  } else {
    log.randomizer(`${tag} Receipt text: session dialogue unavailable, baked class templates in use`, 'warn');
  }
  // Receipt gates arm with the session, not with the first delivery: an overridden
  // chest substitutes its item (and its contextual message) fully natively, so the
  // message gate must already be latched before the first chest can open.
  armReceiptGates();
  // The dungeon-item seams arm with the session too: an assigned key, big key, map or
  // compass must credit the dungeon its id names from the very first one handed over.
  armDungeonItemGrants();
  // The capacity lines ride the same composed dialogue: their ids reach the core with
  // the plan (progressive) or the fixed-line table, so a pickup shows the climb it applied.
  await armCapacitySession(capacity, tag, receiptTexts);
  // A substituted blade or shield on a shelf, on the ground or on a pedestal draws in
  // the equipped gear's colours without these; the hold-up ceremony is untouched.
  await applyGearIcons(tag);
  // The quiver a retro seed hands over as an arrow draws as itself with this; the
  // core shows it only while the retro bow is armed.
  await applyQuiverIcon(tag);
  // A shelf priced in something other than rupees says so beside its digits with these.
  await applyCurrencySymbols(tag);
  // The pond's throw table must be in the core before any prize slot is armed:
  // a prize is handed over by the throw it sits on, so the schedule comes first.
  // Its own lines ride the same composed dialogue, so the ids come from there.
  armPondSession(pondSessionOf(placement, receiptTexts.pondMessages), tag);
  armFireReporting(hooks.reporter);
  applyOverrides(plan, messageIdOf, tag);
  // Both wish ponds after the overrides: a native-economy water pays through their npc entries.
  armWishPondSession(wishPondSessionOf(placement, plan, { messageIdOf, fireIdOf: allocateFireId, lines: receiptTexts.wishPondMessages }), tag);
  armPondDemandSession(pondDemandSessionOf(placement, resolveLocalItemId, receiptTexts.pondDemandMessagesOf), tag);
  return { ok: true, plan, receiptTexts, messageIdOf, pollEntries: pollEntriesOf(plan, tag) };
};

export { armSessionFromPlacement };
export type { SessionArmResult, SessionStartHooks };
