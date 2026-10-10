/* @layer renderer-components @kind logic */
import {
  BYTE_WRAP, COUNTER_CHANGE_RATIO, COUNTER_MAX_STEP, COUNTER_MIN_REPORTS, COUNTER_SMALL_STEP_RATIO,
} from './hid-analysis.constants';

const isSmallStep = (cur: number | undefined, prev: number | undefined): boolean => {
  if (cur === undefined || prev === undefined) return false;
  const d = (cur - prev + BYTE_WRAP) % BYTE_WRAP;
  return d <= COUNTER_MAX_STEP || d >= BYTE_WRAP - COUNTER_MAX_STEP;
};

const isCounterColumn = (reports: Uint8Array[], i: number): boolean => {
  let changes = 0;
  let smallDeltas = 0;
  for (let r = 1; r < reports.length; r++) {
    const cur = reports[r]?.[i];
    const prev = reports[r - 1]?.[i];
    if (cur === prev) continue;
    changes++;
    if (isSmallStep(cur, prev)) smallDeltas++;
  }
  const total = reports.length - 1;
  return changes / total > COUNTER_CHANGE_RATIO && smallDeltas / Math.max(changes, 1) > COUNTER_SMALL_STEP_RATIO;
};

const findCounterBytes = (reports: Uint8Array[]): Set<number> => {
  const counters = new Set<number>();
  if (reports.length < COUNTER_MIN_REPORTS) return counters;
  const len = reports[0]?.length ?? 0;
  for (let i = 0; i < len; i++) {
    if (isCounterColumn(reports, i)) counters.add(i);
  }
  return counters;
};

export { findCounterBytes };
