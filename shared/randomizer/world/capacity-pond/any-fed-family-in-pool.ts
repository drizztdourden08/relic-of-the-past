/* @layer shared-game @kind logic */
import { fedFamiliesOf } from './fed-families-of';
import { isInPool } from './is-in-pool';
import type { CapacityPondSelection } from './capacity-pond-rule.type';

const anyFedFamilyInPool = (selection: CapacityPondSelection): boolean =>
  fedFamiliesOf(selection.retroBow).some((family) => isInPool(selection.capacity[family]));

export { anyFedFamilyInPool };
