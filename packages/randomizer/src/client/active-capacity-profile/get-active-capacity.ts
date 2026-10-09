/* @layer bridge-wasm @kind logic */
import type { ActiveCapacity } from './active-capacity-profile.type';
import { activeCapacityState } from './active-capacity-state';

const getActiveCapacity = (): ActiveCapacity | null => activeCapacityState.active;

export { getActiveCapacity };
