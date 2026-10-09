/* @layer bridge-wasm @kind logic */
import type { ActiveCapacityState } from './active-capacity-profile.type';

const activeCapacityState: ActiveCapacityState = {
  active: null,
  listeners: new Set(),
};

export { activeCapacityState };
