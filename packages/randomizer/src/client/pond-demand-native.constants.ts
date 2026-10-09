/* @layer bridge-wasm @kind constants */
import type { NativeDemand } from './pond-demand-native.type';

const POND_DEMAND_KIND = {
  none: 0,
  rupees: 1,
  arrows: 2,
  bombs: 3,
  hearts: 4,
  bottle: 5,
  item: 6,
} as const;

const NO_DEMAND: NativeDemand = { kind: POND_DEMAND_KIND.none, amount: 0, nativeId: 0 };

export { NO_DEMAND, POND_DEMAND_KIND };
