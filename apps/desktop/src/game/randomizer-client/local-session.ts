/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { CLASS_DEFAULT_MESSAGE } from '@rotp/randomizer';
import { armSessionFromPlacement } from './session-start';
import { disarmSession } from './session-stop';
import { logLocalArmed } from './local-armed-log';
import { reportLocalCheck } from './local-check-report';
import { startLocationPolling } from './location-poller';
import type { Placement, PlanCounts, PlanEntry, RandomizerSession, SessionStatusListener, LocalSession } from '@rotp/randomizer';
import type { MessageIdOf } from './apply-overrides';
import type { SessionReceiptTexts } from './receipt-text-refresh';

const emptyCounts = (): PlanCounts =>
  ({ override: 0, overrideNpc: 0, overrideDrop: 0, overrideStanding: 0, overrideScripted: 0, overrideShop: 0, deliver: 0, vanillaLocked: 0, pollBlind: 0, errors: 0 });

const classDefaultMessage: MessageIdOf = () => CLASS_DEFAULT_MESSAGE;

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
      logLocalArmed(plan.counts);
      setStatus('active');
    },

    reportCheck(location) {
      reportLocalCheck(location, byLocation.get(location), messageIdOf);
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
