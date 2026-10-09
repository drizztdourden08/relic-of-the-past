/* @layer renderer-components @kind logic */
import type { IdleRecordResult } from '../hid-calibration.type';
import { IDLE_SAMPLE_MS } from '../stick-center';
import type { IdleResult } from '../stick-center';

const idleReadingRecord = (label: string, result: IdleResult): IdleRecordResult => ({
  label,
  durationMs: IDLE_SAMPLE_MS,
  frameCount: result.x.idle.frames,
  bytes: [result.x, ...(result.y ? [result.y] : [])].map((axis) => ({
    byteIndex: axis.idx,
    min: axis.idle.min,
    max: axis.idle.max,
    range: axis.idle.max - axis.idle.min,
    average: axis.center,
    uniqueCount: axis.idle.uniqueCount,
    uniqueValues: `${axis.idle.uniqueCount} values`,
  })),
});

export { idleReadingRecord };
