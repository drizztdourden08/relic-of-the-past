/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { deliverItem, deliverNpcCheck } from '../delivery-api';
import { itemKeyName, CLASS_DEFAULT_MESSAGE, COMPLETION_NOTE } from '@rotp/randomizer';
import { armSessionFromPlacement } from './session-start';
import { disarmSession } from './session-stop';
import { startLocationPolling } from './location-poller';
import type { Placement, PlanCounts, PlanEntry, RandomizerSession, SessionStatusListener, LocalSession } from '@rotp/randomizer';
import type { MessageIdOf } from './apply-overrides';
import type { SessionReceiptTexts } from './receipt-text-refresh';

const emptyCounts = (): PlanCounts =>
  ({ override: 0, overrideNpc: 0, overrideDrop: 0, overrideStanding: 0, overrideScripted: 0, overrideShop: 0, deliver: 0, vanillaLocked: 0, pollBlind: 0, errors: 0 });

const classDefaultMessage: MessageIdOf = () => CLASS_DEFAULT_MESSAGE;

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
  let messageIdOf: MessageIdOf = classDefaultMessage;
  let receiptTexts: SessionReceiptTexts | null = null;

  const setStatus = (next: RandomizerSession['status']): void => {
    status = next;
    for (const listener of listeners) {
      try { listener(next); } catch { continue; }
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
      messageIdOf = classDefaultMessage;
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
export type { LocalSession } from '@rotp/randomizer';
