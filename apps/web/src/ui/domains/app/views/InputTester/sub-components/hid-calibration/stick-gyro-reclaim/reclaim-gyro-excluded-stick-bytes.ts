/* @layer renderer-components @kind logic */
import { GYRO_RECLAIM_MIN_RANGE, STICK_PAIR_SIZE } from './stick-gyro-reclaim.constants';
import type { GyroReclaimRefs } from './stick-gyro-reclaim.type';

const reclaimGyroExcludedStickBytes = (refs: GyroReclaimRefs, mins: Uint8Array, maxs: Uint8Array, addLog: (msg: string) => void): void => {
  const reclaimed: number[] = [];
  for (const i of refs.gyroExcludedBytesRef.current) {
    if (!refs.excludedRef.current.has(i)) continue;
    if (maxs[i] - mins[i] < GYRO_RECLAIM_MIN_RANGE) continue;
    reclaimed.push(i);
  }
  reclaimed.sort((a, b) => (maxs[b] - mins[b]) - (maxs[a] - mins[a]));
  for (const i of reclaimed.slice(0, STICK_PAIR_SIZE)) {
    refs.excludedRef.current.delete(i);
    refs.gyroExcludedBytesRef.current.delete(i);
    addLog(`byte[${i}] reclaimed from gyro exclusion for the stick: range ${maxs[i] - mins[i]} looks like a real sweep, not noise.`);
  }
};

export { reclaimGyroExcludedStickBytes };
