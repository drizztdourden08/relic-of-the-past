/* @layer shared-game @kind logic */
import { meterUsesMultiplier } from './meter-uses-multiplier';
import type { CollectionState } from '../collection-state.type';

const hasMeterCapacity = (state: CollectionState): boolean => meterUsesMultiplier(state) > 0;

export { hasMeterCapacity };
