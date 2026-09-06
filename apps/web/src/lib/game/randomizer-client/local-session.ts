/* @layer bridge-wasm @kind logic */
/**
 * Local randomizer session — plays a generated placement against the live
 * core with no server. start() classifies the placement into the physical
 * plan (ap-bridge), refuses loudly when the plan carries errors, applies the
 * chest, npc-grant and key-drop overrides in-core, and arms the poller over
 * every detectable planned location. Reports: overrides (chest, npc, drop) and
 * vanilla-locked locations are log-only (the game grants the item
 * physically), deliver entries route through the delivery queue — the NPC
 * trigger when the check's gameId carries one, the plain item grant
 * otherwise.
 */

import { log } from '../../log-bus';
import { deliverItem, deliverNpcCheck } from '../delivery-api';
import { clear as clearDeliveryQueue } from '../delivery-queue';
import { armReceiptGates, disarmReceiptGates } from '../receipt-grants';
import { clearItemOverrides } from '../randomizer';
import { clearNpcGrantOverrides } from '../npc-grant-overrides';
import { clearDropOverrides } from '../drop-overrides';
import { clearScriptedGrantOverrides } from '../scripted-grant-overrides';
import { clearStandingOverrides } from '../standing-overrides';
import { disarmPrizeShuffle } from '../prize-shuffle';
import { armDungeonItemGrants, disarmDungeonItemGrants } from '../dungeon-item-grants';
import { clearSessionDialogue } from '../session-dialogue';
import { applyGearIcons, clearGearIcons } from '../gear-icons';
import { applyQuiverIcon, clearQuiverIcon } from '../quiver-icon';
import { applyCurrencySymbols, clearCurrencySymbols } from '../currency-symbols';
import {
  capacityBonusOfStats, capacityProfileOfStats, capacityProgressiveOfStats,
} from '@shared/randomizer/ap-world/fill/placement-capacity';
import { buildPhysicalPlan, logPlanSummary } from './ap-bridge';
import { startSessionReceiptTexts } from './receipt-text-refresh';
import { applyOverrides, pollEntriesOf } from './apply-overrides';
import {
  armCapacitySession, capacitySessionOf, disarmCapacitySession, primeCapacitySession,
} from './capacity-session';
import { armPondSession, disarmPondSession, pondSessionOf } from './pond-session';
import { armItemBehavior, disarmItemBehavior, itemBehaviorOf } from './item-behavior-session';
import { armFireReporting, disarmFireReporting } from './override-fire-registry';
import { startLocationPolling, stopLocationPolling } from './location-poller';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { MessageIdOf } from './apply-overrides';
import type { PlanCounts, PlanEntry } from './physical-plan.type';
import type { SessionReceiptTexts } from './receipt-text-refresh';
import type { RandomizerSession, SessionStatusListener } from './session.type';

interface LocalSession extends RandomizerSession {
  readonly kind: 'local';
  onStatusChange(listener: SessionStatusListener): () => void;
  /** Arm-time plan counts, populated by start() — the status view reads these. */
  readonly stats: PlanCounts;
}

const emptyCounts = (): PlanCounts =>
  ({ override: 0, overrideNpc: 0, overrideDrop: 0, overrideStanding: 0, overrideScripted: 0, overrideShop: 0, deliver: 0, vanillaLocked: 0, pollBlind: 0, errors: 0 });

const deliverEntry = (entry: PlanEntry, messageId: number): void => {
  if (entry.targetLocalId === undefined) {
    log.randomizer(`[Local] Cannot deliver "${entry.itemName}" for "${entry.locationName}": unresolvable`, 'error');
    return;
  }
  const contextual = messageId >= 0 ? messageId : undefined;
  const queued = entry.npcGrant !== undefined
    ? deliverNpcCheck(entry.npcGrant.flagType, entry.npcGrant.flagMask, entry.targetLocalId,
      entry.npcGrant.spriteType, entry.npcGrant.postGfx, entry.itemName, 'randomizer', contextual)
    : deliverItem(entry.targetLocalId, entry.itemName, 'randomizer', contextual);
  if (queued === null) {
    log.randomizer(`[Local] Delivery refused for "${entry.locationName}": game not running or module gone`, 'error');
  }
};

const createLocalSession = (placement: ApPlacement): LocalSession => {
  const listeners = new Set<SessionStatusListener>();
  const byLocation = new Map<string, PlanEntry>();
  let stats = emptyCounts();
  let status: RandomizerSession['status'] = 'idle';
  let messageIdOf: MessageIdOf = () => -1;
  let receiptTexts: SessionReceiptTexts | null = null;

  const setStatus = (next: RandomizerSession['status']): void => {
    status = next;
    for (const listener of listeners) {
      try { listener(next); } catch { /* never let a bad listener break the session */ }
    }
  };

  const session: LocalSession = {
    kind: 'local',
    get status() { return status; },
    get stats() { return stats; },

    async start() {
      setStatus('starting');
      log.randomizer(`[Local] Starting session: seed ${placement.seed}, ${Object.keys(placement.nameView).length} locations`);
      // The persisted placement carries the profile it was generated with; its wallet
      // table must exist before the plan resolves the wallet item names.
      const capacity = capacitySessionOf(
        capacityProfileOfStats(placement.stats), capacityProgressiveOfStats(placement.stats),
        capacityBonusOfStats(placement.stats),
      );
      primeCapacitySession(capacity);
      // Which rungs of each tiered family exist, and how helpful the items are.
      // Armed before the plan resolves anything: a progressive copy's presentation
      // is read off the ladder, so the ladder has to be the seed's own first.
      armItemBehavior(itemBehaviorOf(placement.stats), '[Local]');
      const plan = buildPhysicalPlan(placement);
      stats = plan.counts;
      logPlanSummary(plan, '[Local]');
      if (plan.errors.length > 0) {
        log.randomizer(`[Local] Session refused: ${plan.errors.length} plan errors (see above)`, 'error');
        log.randomizer('[Local] NO overrides were applied. The game is running UNRANDOMIZED: '
          + 'every location gives its vanilla item until the profile is recreated.', 'error');
        disarmPondSession();
        disarmCapacitySession();
        disarmItemBehavior();
        setStatus('error');
        return;
      }
      for (const entry of plan.entries) byLocation.set(entry.locationName, entry);
      // Pre-render every planned grant's contextual line from the frozen placement and
      // the tracker's counts, and push the composed session dialogue into the core
      // BEFORE the overrides arm, so the very first chest already carries its exact
      // per-event message id. The lines follow the tracker from here on.
      receiptTexts?.stop();
      receiptTexts = startSessionReceiptTexts(plan, placement, '[Local]');
      messageIdOf = receiptTexts.messageIdOf;
      if (receiptTexts.composed) {
        log.randomizer('[Local] Receipt text: contextual message lines composed and armed, following the tracker');
      } else {
        log.randomizer('[Local] Receipt text: session dialogue unavailable — baked class templates in use', 'warn');
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
      await armCapacitySession(capacity, '[Local]', receiptTexts);
      // A substituted blade or shield on a shelf, on the ground or on a pedestal draws in
      // the equipped gear's colours without these; the hold-up ceremony is untouched.
      await applyGearIcons('[Local]');
      // The quiver a retro seed hands over as an arrow draws as itself with this; the
      // core shows it only while the retro bow is armed.
      await applyQuiverIcon('[Local]');
      // A shelf priced in something other than rupees says so beside its digits with these.
      await applyCurrencySymbols('[Local]');
      // The pond's throw table must be in the core before any prize slot is armed:
      // a prize is handed over by the throw it sits on, so the schedule comes first.
      // Its own lines ride the same composed dialogue, so the ids come from there.
      armPondSession(pondSessionOf(placement, receiptTexts.pondMessages), '[Local]');
      armFireReporting(session);
      applyOverrides(plan, messageIdOf, '[Local]');
      startLocationPolling(session, pollEntriesOf(plan, '[Local]'));
      log.randomizer(`[Local] Session armed: ${plan.counts.override} chest + ${plan.counts.overrideNpc} npc `
        + `+ ${plan.counts.overrideDrop} drop + ${plan.counts.overrideStanding} standing overrides applied, `
        + `${plan.counts.deliver} deliver checks, ${plan.counts.vanillaLocked} vanilla-locked`);
      setStatus('active');
    },

    reportCheck(locationName) {
      const entry = byLocation.get(locationName);
      if (!entry) {
        log.randomizer(`[Local] Check completed: ${locationName} (not in plan — nothing to do)`, 'warn');
        return;
      }
      if (entry.planClass === 'override') {
        log.randomizer(`[Local] Check completed: ${locationName} — "${entry.itemName}" granted physically`);
        return;
      }
      if (entry.planClass === 'override-npc') {
        log.randomizer(`[Local] Check completed: ${locationName} — "${entry.itemName}" granted natively by the giver`);
        return;
      }
      if (entry.planClass === 'override-drop') {
        log.randomizer(`[Local] Check completed: ${locationName} — "${entry.itemName}" granted physically by the drop`);
        return;
      }
      if (entry.planClass === 'override-standing') {
        log.randomizer(`[Local] Check completed: ${locationName} — "${entry.itemName}" granted physically by the pickup`);
        return;
      }
      if (entry.planClass === 'override-scripted') {
        log.randomizer(`[Local] Check completed: ${locationName} — "${entry.itemName}" granted by the scripted giver`);
        return;
      }
      if (entry.planClass === 'override-shop') {
        log.randomizer(`[Local] Check completed: ${locationName} — "${entry.itemName}" bought from the shelf`);
        return;
      }
      if (entry.planClass === 'vanilla-locked') {
        log.randomizer(`[Local] Check completed: ${locationName} — vanilla "${entry.itemName}" (locked, no action)`);
        return;
      }
      log.randomizer(`[Local] Check completed: ${locationName} — delivering "${entry.itemName}"`);
      deliverEntry(entry, messageIdOf(locationName));
    },

    stop() {
      stopLocationPolling();
      disarmFireReporting();
      clearItemOverrides();
      clearNpcGrantOverrides();
      clearDropOverrides();
      clearStandingOverrides();
      clearScriptedGrantOverrides();
      disarmPrizeShuffle();
      disarmDungeonItemGrants();
      disarmPondSession();
      disarmCapacitySession();
      disarmItemBehavior();
      clearGearIcons();
      clearQuiverIcon();
      clearCurrencySymbols();
      // Drop still-queued deliveries with the session — a stopped session must not
      // leave receipt entries retrying forever (clear() resolves completions safely).
      clearDeliveryQueue();
      disarmReceiptGates();
      // Restore the baked dialogue blob — the session's pre-rendered lines go with it.
      receiptTexts?.stop();
      receiptTexts = null;
      clearSessionDialogue();
      messageIdOf = () => -1;
      byLocation.clear();
      log.randomizer('[Local] Session stopped');
      setStatus('idle');
    },

    onStatusChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return session;
};

export { createLocalSession };
export type { LocalSession };
