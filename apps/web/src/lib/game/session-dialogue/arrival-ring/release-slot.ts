/* @layer bridge-wasm @kind logic */
import { ARRIVAL_SLOTS } from './arrival-ring.constants';
import type { ArrivalRing } from './arrival-ring.type';

const releaseSlot = (ring: ArrivalRing, slot: number): void => {
  if (slot >= 0 && slot < ARRIVAL_SLOTS) ring.busy[slot] = false;
};

export { releaseSlot };
