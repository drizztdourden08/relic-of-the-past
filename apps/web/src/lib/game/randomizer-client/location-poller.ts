/* @layer bridge-wasm @kind logic */
/**
 * Location poller: watches live memory for newly-completed planned checks
 * and reports each one, once, to the active randomizer session. Polls ONLY
 * what the session's plan includes, over the three detection modes the plan
 * can carry: persisted room-flag words (with the loaded room's live bits
 * folded in, mirroring tracker/flag-polling.ts), overworld event bytes, and
 * progress-buffer bytes (bit mask or threshold).
 */

import { getModule } from '../wasm-bridge';
import { log } from '../../log-bus';
import type { CheckDetection } from './check-detection';
import type { RandomizerSession } from './session.type';

type ReportingSession = Pick<RandomizerSession, 'reportCheck'>;

/** One polled location: the session key it reports under, and how to read it. */
interface PollEntry {
  key: string;
  detection: CheckDetection;
}

const POLL_INTERVAL_MS = 1000;

let intervalId: ReturnType<typeof setInterval> | null = null;
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

const pollOnce = (session: ReportingSession, entries: readonly PollEntry[]): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    const reads = buildHeapReads(mod);
    if (!reads) return;
    for (const entry of entries) {
      if (reported.has(entry.key)) continue;
      if (isDetectionMet(entry.detection, reads)) {
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

const stopLocationPolling = (): void => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    log.randomizer('[Poller] Location polling stopped');
  }
  reported.clear();
};

const startLocationPolling = (session: ReportingSession, entries: readonly PollEntry[]): void => {
  stopLocationPolling();
  log.randomizer(`[Poller] Location polling started: ${entries.length} checks (every ${POLL_INTERVAL_MS}ms)`);
  intervalId = setInterval(() => pollOnce(session, entries), POLL_INTERVAL_MS);
};

export { startLocationPolling, stopLocationPolling, suppressLocationReport };
export type { PollEntry };
