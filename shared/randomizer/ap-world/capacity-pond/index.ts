/* @layer shared-game @kind barrel */
/** Barrel for the rule binding the capacity families to the wishing pond. */
export { CAPACITY_POND_NOTES } from './capacity-pond-notes.data';
export { POND_FED_FAMILIES, fedFamiliesOf, reconcileCapacityPond } from './capacity-pond-rule';
export type { PondFedFamily } from './capacity-pond-rule';
export { pondStatusOf } from './pond-status';
export type {
  CapacityPondAuthority, CapacityPondSelection, ReconciledCapacityPond,
} from './capacity-pond-rule.type';
