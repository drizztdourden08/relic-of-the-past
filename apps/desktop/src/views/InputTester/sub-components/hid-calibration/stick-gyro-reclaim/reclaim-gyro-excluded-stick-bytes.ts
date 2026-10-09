/* @layer renderer-components @kind logic */
import { GYRO_RECLAIM_MIN_RANGE, STICK_PAIR_SIZE } from './stick-gyro-reclaim.constants';
import type { GyroReclaimRefs } from './stick-gyro-reclaim.type';

const reclaimGyroExcludedStickBytes = (refs: GyroReclaimRefs, mins: Uint8Array, maxs: Uint8Array, addLog: (msg: string) => void): void => {
  const reclaimed: { idx: number; range: number }[] = [];
  for (const idx of refs.gyroExcludedBytesRef.current) {
    if (!refs.excludedRef.current.has(idx)) continue;
    const min = mins[idx];
    const max = maxs[idx];
    if (min === undefined || max === undefined || max - min < GYRO_RECLAIM_MIN_RANGE) continue;
    reclaimed.push({ idx, range: max - min });
  }
  reclaimed.sort((a, b) => b.range - a.range);
  for (const { idx, range } of reclaimed.slice(0, STICK_PAIR_SIZE)) {
    refs.excludedRef.current.delete(idx);
    refs.gyroExcludedBytesRef.current.delete(idx);
    addLog(`byte[${idx}] reclaimed from gyro exclusion for the stick: range ${range} looks like a real sweep, not noise.`);
  }
};

export { reclaimGyroExcludedStickBytes };
