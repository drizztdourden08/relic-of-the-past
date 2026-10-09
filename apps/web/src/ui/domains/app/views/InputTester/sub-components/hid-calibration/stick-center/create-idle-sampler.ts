/* @layer renderer-components @kind logic */
import type { StickCandidate } from '../hid-calibration.type';
import type { IdleSampler } from './stick-center.type';

const createIdleSampler = (x: StickCandidate, y: StickCandidate | null, now: number): IdleSampler =>
  ({ x, y, startedAt: now, runs: y ? [[], []] : [[]] });

export { createIdleSampler };
