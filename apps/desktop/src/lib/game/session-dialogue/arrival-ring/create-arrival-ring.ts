/* @layer bridge-wasm @kind logic */
import { ARRIVAL_SLOTS, FREE_LINE } from './arrival-ring.constants';
import type { ArrivalRing } from './arrival-ring.type';

const createArrivalRing = (): ArrivalRing => ({
  lines: Array.from({ length: ARRIVAL_SLOTS }, () => FREE_LINE),
  busy: Array.from({ length: ARRIVAL_SLOTS }, () => false),
  next: 0,
});

export { createArrivalRing };
