/* @layer renderer-components @kind logic */
/**
 * Reconsiders bytes the gyro profiling step excluded, when a stick capture
 * cannot find a sensible candidate on its own. Split out of
 * report-processing.ts for file-size compliance; used only by processStickFrame.
 */
import type React from 'react';

/** Below this, a byte's movement reads as gyro/accelerometer noise rather
 *  than a deliberate stick sweep. */
const GYRO_RECLAIM_MIN_RANGE = 20;
/** How long a stick capture can run without a sensible candidate before it
 *  reconsiders bytes the gyro step excluded. */
const GYRO_RECLAIM_DELAY_MS = 1000;

interface GyroReclaimRefs {
  excludedRef: React.MutableRefObject<Set<number>>;
  /** Bytes the gyro step excluded: the only pool a stick capture is allowed
   *  to reclaim from. Never touches a byte another step (stick/trigger) has
   *  since claimed. */
  gyroExcludedBytesRef: React.MutableRefObject<Set<number>>;
  /** Set by the caller when stick recording starts (Date.now()), read here to
   *  gate the reclaim on elapsed time rather than sample count. */
  stickCaptureStartedAtRef: React.MutableRefObject<number>;
  /** Reclaim runs at most once per stick capture; the caller resets this to
   *  false when a new capture starts. */
  stickReclaimAttemptedRef: React.MutableRefObject<boolean>;
}

/** Whether a stick capture has gone long enough without a sensible pair that
 *  it should reconsider the gyro step's exclusions. */
const shouldAttemptGyroReclaim = (refs: GyroReclaimRefs, candidateCount: number): boolean =>
  candidateCount < 2
  && !refs.stickReclaimAttemptedRef.current
  && refs.gyroExcludedBytesRef.current.size > 0
  && refs.stickCaptureStartedAtRef.current > 0
  && Date.now() - refs.stickCaptureStartedAtRef.current >= GYRO_RECLAIM_DELAY_MS;

/**
 * A real stick sweep produces a large, coherent range on its bytes; gyro/
 * accelerometer noise from waving the controller around is jittery and stays
 * small, so the same range threshold the normal candidate search uses is
 * enough to tell them apart. Un-excludes whatever qualifies (at most a pair)
 * and logs each one plainly. Never a silent change to the exclusion set.
 */
const reclaimGyroExcludedStickBytes = (refs: GyroReclaimRefs, mins: Uint8Array, maxs: Uint8Array, addLog: (msg: string) => void): void => {
  const reclaimed: number[] = [];
  for (const i of refs.gyroExcludedBytesRef.current) {
    if (!refs.excludedRef.current.has(i)) continue;
    if (maxs[i] - mins[i] < GYRO_RECLAIM_MIN_RANGE) continue;
    reclaimed.push(i);
  }
  reclaimed.sort((a, b) => (maxs[b] - mins[b]) - (maxs[a] - mins[a]));
  for (const i of reclaimed.slice(0, 2)) {
    refs.excludedRef.current.delete(i);
    refs.gyroExcludedBytesRef.current.delete(i);
    addLog(`byte[${i}] reclaimed from gyro exclusion for the stick: range ${maxs[i] - mins[i]} looks like a real sweep, not noise.`);
  }
};

export { reclaimGyroExcludedStickBytes, shouldAttemptGyroReclaim };
export type { GyroReclaimRefs };
