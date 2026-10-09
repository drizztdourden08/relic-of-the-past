/* @layer bridge-wasm @kind logic */
import type { ActiveCapacity } from './active-capacity-profile.type';
import { activeCapacityState } from './active-capacity-state';

const setActiveCapacity = (next: ActiveCapacity | null): void => {
  activeCapacityState.active = next;
  for (const listener of activeCapacityState.listeners) {
    try { listener(next); } catch { continue; }
  }
};

export { setActiveCapacity };
