/* @layer renderer-components @kind logic */
import {
  BYTE_WRAP, COUNTER_CHANGE_RATIO, COUNTER_MAX_STEP, COUNTER_MIN_REPORTS, COUNTER_SMALL_STEP_RATIO,
} from './hid-analysis.constants';

const findCounterBytes = (reports: Uint8Array[]): Set<number> => {
  const counters = new Set<number>();
  if (reports.length < COUNTER_MIN_REPORTS) return counters;
  const len = reports[0].length;
  for (let i = 0; i < len; i++) {
    let changes = 0;
    let smallDeltas = 0;
    for (let r = 1; r < reports.length; r++) {
      if (reports[r][i] !== reports[r - 1][i]) {
        changes++;
        const d = (reports[r][i] - reports[r - 1][i] + BYTE_WRAP) % BYTE_WRAP;
        if (d <= COUNTER_MAX_STEP || d >= BYTE_WRAP - COUNTER_MAX_STEP) smallDeltas++;
      }
    }
    const total = reports.length - 1;
    if (changes / total > COUNTER_CHANGE_RATIO && smallDeltas / Math.max(changes, 1) > COUNTER_SMALL_STEP_RATIO) {
      counters.add(i);
    }
  }
  return counters;
};

export { findCounterBytes };
