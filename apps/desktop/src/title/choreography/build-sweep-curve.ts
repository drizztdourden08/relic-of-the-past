/* @layer renderer-hud @kind logic */
import { CURVE_STEPS, DWELL_AT, DWELL_SPEED, DWELL_WIDTH } from './logo-sweep.constants';

const buildSweepCurve = (): Float32Array => {
  const table = new Float32Array(CURVE_STEPS + 1);
  let travelled = 0;
  for (let i = 1; i <= CURVE_STEPS; i++) {
    const u = i / CURVE_STEPS;
    const dip = Math.exp(-(((u - DWELL_AT) / DWELL_WIDTH) ** 2));
    travelled += 1 - (1 - DWELL_SPEED) * dip;
    table[i] = travelled;
  }
  for (const [i, value] of table.entries()) table[i] = value / travelled;
  return table;
};

export { buildSweepCurve };
