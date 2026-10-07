/* @layer bridge-wasm @kind logic */
/**
 * Local randomizer session: plays a generated placement against the live
 * core with no server. start() runs the shared start sequence
 * (session-start.ts: the physical plan, refused loudly on plan errors, then every
 * in-core table), and arms the poller over every detectable planned location.
 * Reports: overrides (chest, npc, drop) and
 * vanilla-locked locations are log-only (the game grants the item
 * physically), deliver entries route through the delivery queue, so the NPC
 * trigger when the check's gameId carries one, the plain item grant
 * otherwise.
 */

import { log } from '../../log-bus';
import { deliverItem, deliverNpcCheck } from '../delivery-api';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { armSessionFromPlacement } from './session-start';
import { disarmSession } from './session-stop';
import { startLocationPolling } from './location-poller';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { MessageIdOf } from './apply-overrides';
import type { PlanCounts, PlanEntry } from './physical-plan.type';
import type { SessionReceiptTexts } from './receipt-text-refresh';
import type { RandomizerSession, SessionStatusListener } from './session.type';

interface LocalSession extends RandomizerSession {
  readonly kind: 'local';
  onStatusChange(listener: SessionStatusListener): () => void;
  /** Arm-time plan counts, populated by start(), which the status view reads. */
  readonly stats: PlanCounts;
}

const emptyCounts = (): PlanCounts =>
  ({ override: 0, overrideNpc: 0, overrideDrop: 0, overrideStanding: 0, overrideScripted: 0, overrideShop: 0, deliver: 0, vanillaLocked: 0, pollBlind: 0, errors: 0 });

/** What each completed plan class logs; deliver is the one class the session acts on. */
const COMPLETION_NOTE: Partial<Record<PlanEntry['planClass'], string>> = {
  'override': 'granted physically',
  'override-npc': 'granted natively by the giver',
  'override-drop': 'granted physically by the drop',
  'override-standing': 'granted physically by the pickup',
  'override-scripted': 'granted by the scripted giver',
  'override-shop': 'bought from the shelf',
};

const deliverEntry = (entry: PlanEntry, messageId: number): void => {
  if (entry.targetLocalId === undefined) {
    log.randomizer(`[Local] Cannot deliver "${entry.item}" for "${entry.location}": unresolvable`, 'error');
    return;
  }
  const contextual = messageId >= 0 ? messageId : undefined;
  const queued = entry.npcGrant !== undefined
    ? deliverNpcCheck(entry.npcGrant.flagType, entry.npcGrant.flagMask, entry.targetLocalId,
      entry.npcGrant.spriteType, entry.npcGrant.postGfx, itemKeyName(entry.item), 'randomizer', contextual)
    : deliverItem(entry.targetLocalId, itemKeyName(entry.item), 'randomizer', contextual);
  if (queued === null) {
    log.randomizer(`[Local] Delivery refused for "${entry.location}": game not running or module gone`, 'error');
  }
};

const createLocalSession = (placement: Placement): LocalSession => {
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
      log.randomizer(`[Local] Starting session: seed ${placement.seed}, ${Object.keys(placement.locations).length} locations`);
      receiptTexts?.stop();
      receiptTexts = null;
      const armed = await armSessionFromPlacement(placement, '[Local]', { reporter: session });
      stats = armed.plan.counts;
      if (!armed.ok) {
        setStatus('error');
        return;
      }
      const { plan } = armed;
      for (const entry of plan.entries) byLocation.set(entry.location, entry);
      receiptTexts = armed.receiptTexts;
      messageIdOf = armed.messageIdOf;
      startLocationPolling(session, armed.pollEntries);
      log.randomizer(`[Local] Session armed: ${plan.counts.override} chest + ${plan.counts.overrideNpc} npc `
        + `+ ${plan.counts.overrideDrop} drop + ${plan.counts.overrideStanding} standing overrides applied, `
        + `${plan.counts.deliver} deliver checks, ${plan.counts.vanillaLocked} vanilla-locked`);
      setStatus('active');
    },

    reportCheck(location) {
      const entry = byLocation.get(location);
      if (!entry) {
        log.randomizer(`[Local] Check completed: ${location} (not in plan, nothing to do)`, 'warn');
        return;
      }
      const note = COMPLETION_NOTE[entry.planClass];
      if (note !== undefined) {
        log.randomizer(`[Local] Check completed: ${location}: "${entry.item}" ${note}`);
        return;
      }
      if (entry.planClass === 'vanilla-locked') {
        log.randomizer(`[Local] Check completed: ${location}: vanilla "${entry.item}" (locked, no action)`);
        return;
      }
      log.randomizer(`[Local] Check completed: ${location}: delivering "${entry.item}"`);
      deliverEntry(entry, messageIdOf(location));
    },

    stop() {
      receiptTexts?.stop();
      receiptTexts = null;
      disarmSession();
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
