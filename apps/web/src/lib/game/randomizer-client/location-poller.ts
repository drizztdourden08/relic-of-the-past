/* @layer bridge-wasm @kind logic */
/**
 * Location poller: watches for newly-completed planned checks and reports each one, once, to
 * the active randomizer session. Polls ONLY what the session's plan includes.
 *
 * Two sources, one per row, and the second is why a row can be reported at all when the plan
 * carries no detection for it:
 *
 *  - the plan's own detection, read here, which stays because a plan detection is not always
 *    the record's own: a locked capacity family's compare is re-based on its starting rung
 *    (withProgressBaseline), and only the plan knows that;
 *  - for a row with no plan detection, the tracker's own completion sweep
 *    (tracker/completed-checks-core.ts, over check-facts.ts), which reads every mode a record
 *    can carry INCLUDING the event ledger. This module had no reading of the ledger at all, so
 *    a row recorded only there was logged poll-blind and never reported.
 */

import { getModule } from '../wasm-bridge';
import { log } from '../../log-bus';
import { getCompletedChecks } from '../tracker';
import { rescanShopCatchUp } from './apply-overrides';
import type { CheckDetection } from './check-detection';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { RandomizerSession } from './session.type';

type ReportingSession = Pick<RandomizerSession, 'reportCheck'>;

/**
 * One polled location: the session key it reports under, the record behind it when there is
 * one, and the plan's own read when it carries one. At least one of the two answers, or the
 * plan would not have kept the entry.
 */
interface PollEntry {
  key: LocationKey;
  checkId?: string;
  detection?: CheckDetection;
}

const POLL_INTERVAL_MS = 1000;

let intervalId: ReturnType<typeof setInterval> | null = null;
let polledEntries: readonly PollEntry[] = [];
let rebaselinePending = false;
const reported = new Set<string>();

const thresholdMet = (val: number, compare: 'gte' | 'eq' | 'any-of', value: number | number[] | undefined): boolean => {
  if (compare === 'gte') return val >= (value as number);
  if (compare === 'eq') return val === (value as number);
  if (compare === 'any-of') return (value as number[]).includes(val);
  return false;
};

interface HeapReads {
  roomWord: (roomId: number) => number;
  owByte: (owScreen: number) => number;
  progByte: (bufferIndex: number) => number;
}

const buildHeapReads = (mod: NonNullable<ReturnType<typeof getModule>>): HeapReads | null => {
  const heap = (mod as unknown as { HEAPU8?: Uint8Array }).HEAPU8;
  if (!heap) return null;
  const roomPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
  const livePtr = mod.ccall('WasmGetLiveRoomFlags', 'number', [], []) as number;
  const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
  const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
  if (!roomPtr) return null;
  let liveRoomId = -1;
  let liveFlags = 0;
  if (livePtr) {
    liveRoomId = heap[livePtr] | (heap[livePtr + 1] << 8);
    liveFlags = heap[livePtr + 2] | (heap[livePtr + 3] << 8);
  }
  return {
    roomWord: (roomId) => {
      const offset = roomPtr + roomId * 2;
      const flags = heap[offset] | (heap[offset + 1] << 8);
      return roomId === liveRoomId ? flags | liveFlags : flags;
    },
    owByte: (owScreen) => (owPtr ? heap[owPtr + owScreen] : 0),
    progByte: (bufferIndex) => (progPtr ? heap[progPtr + bufferIndex] : 0),
  };
};

const isDetectionMet = (detection: CheckDetection, reads: HeapReads): boolean => {
  if (detection.mode === 'room-mask') return (reads.roomWord(detection.roomId) & detection.mask) !== 0;
  if (detection.mode === 'ow-mask') return (reads.owByte(detection.owScreen) & detection.mask) !== 0;
  if (detection.mask !== undefined) return (reads.progByte(detection.bufferIndex) & detection.mask) !== 0;
  if (detection.compare !== undefined) {
    return thresholdMet(reads.progByte(detection.bufferIndex), detection.compare, detection.value);
  }
  return false;
};

/**
 * Whether one entry reads as complete. The plan's own detection answers when it carries one,
 * because only the plan knows a re-based compare; the sweep answers for the rest, which is the
 * only reading a row recorded in the event ledger has. Never both: the sweep also resolves
 * records from other records (derived-checks.ts), and a row that already reads straight from
 * memory must not gain a second, looser way to fire.
 */
const isEntryComplete = (entry: PollEntry, reads: HeapReads, completed: ReadonlySet<string>): boolean => {
  if (entry.detection !== undefined) return isDetectionMet(entry.detection, reads);
  return entry.checkId !== undefined && completed.has(entry.checkId);
};

/**
 * Adopt the loaded state's own completions as the baseline: everything it already shows as
 * done counts as reported, everything it does not becomes eligible again. Replaces the set
 * instead of adding to it, so a state loaded BACKWARDS re-arms the checks it undid.
 */
const applyRebaseline = (entries: readonly PollEntry[], reads: HeapReads, completed: ReadonlySet<string>): void => {
  reported.clear();
  for (const entry of entries) {
    if (isEntryComplete(entry, reads, completed)) reported.add(entry.key);
  }
  log.randomizer(`[Poller] Re-baselined after a state load: ${reported.size}/${entries.length} already complete`);
};

const pollOnce = (session: ReportingSession, entries: readonly PollEntry[]): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    // Rechecked every tick, not once at arm time: a shelf armed before the profile's
    // real SRAM became the active WRAM state (a test harness loading a state into an
    // already-running module) would otherwise read a stale sold counter forever.
    rescanShopCatchUp();
    const reads = buildHeapReads(mod);
    if (!reads) return;
    const completed = getCompletedChecks();
    // A pending re-baseline is resolved on a TICK, never at the load call itself: the flag
    // words the detections read only latch into WRAM a frame after the load re-asserts them,
    // so reading immediately would see a zeroed buffer and re-arm every check instead.
    if (rebaselinePending) {
      rebaselinePending = false;
      applyRebaseline(entries, reads, completed);
      return;
    }
    for (const entry of entries) {
      if (reported.has(entry.key)) continue;
      if (isEntryComplete(entry, reads, completed)) {
        reported.add(entry.key);
        log.randomizer(`[Poller] Check completed: ${entry.key}`);
        session.reportCheck(entry.key);
      }
    }
  } catch {
    // Module may not be ready yet
  }
};

/**
 * Take a location out of polling's reporting (e.g. an armed physical override
 * whose completion arrives from the substitution seam instead, a possession
 * detection would false-fire when the vanilla item arrives from elsewhere).
 */
const suppressLocationReport = (key: string): void => {
  reported.add(key);
};

/**
 * Called after a save state is loaded. The reported set lives in JS while the completions it
 * mirrors live in WRAM, and a state load swaps that WRAM wholesale, so without this the poller
 * reads a stateful of already-collected checks as brand new and reports every one, re-delivering
 * each deliver-class check the state had already handed over.
 *
 * The request latches whether or not polling is running yet. An automation boot loads its state
 * BEFORE the session connects, so a request that only counted while the interval existed was
 * dropped on the floor and the first tick after the connect re-delivered the lot.
 */
const requestLocationRebaseline = (): void => {
  rebaselinePending = true;
};

const stopLocationPolling = (): void => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    log.randomizer('[Poller] Location polling stopped');
  }
  reported.clear();
  polledEntries = [];
  rebaselinePending = false;
};

const startLocationPolling = (session: ReportingSession, entries: readonly PollEntry[]): void => {
  stopLocationPolling();
  // The first tick always adopts what is already complete instead of reporting it. Whatever
  // the state was when polling started is not news, and an automation boot loads its state
  // around the connect, so waiting for a load's own request to arrive first is a race the
  // poller loses by re-delivering every check the state had already handed over.
  rebaselinePending = true;
  polledEntries = entries;
  log.randomizer(`[Poller] Location polling started: ${entries.length} checks (every ${POLL_INTERVAL_MS}ms)`);
  intervalId = setInterval(() => pollOnce(session, polledEntries), POLL_INTERVAL_MS);
};

export { requestLocationRebaseline, startLocationPolling, stopLocationPolling, suppressLocationReport };
export type { PollEntry };
