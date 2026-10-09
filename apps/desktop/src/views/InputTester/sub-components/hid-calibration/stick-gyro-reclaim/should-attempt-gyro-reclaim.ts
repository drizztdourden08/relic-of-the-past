/* @layer renderer-components @kind logic */
import { GYRO_RECLAIM_DELAY_MS, STICK_PAIR_SIZE } from './stick-gyro-reclaim.constants';
import type { GyroReclaimRefs } from './stick-gyro-reclaim.type';

const shouldAttemptGyroReclaim = (refs: GyroReclaimRefs, candidateCount: number): boolean =>
  candidateCount < STICK_PAIR_SIZE
  && !refs.stickReclaimAttemptedRef.current
  && refs.gyroExcludedBytesRef.current.size > 0
  && refs.stickCaptureStartedAtRef.current > 0
  && Date.now() - refs.stickCaptureStartedAtRef.current >= GYRO_RECLAIM_DELAY_MS;

export { shouldAttemptGyroReclaim };
