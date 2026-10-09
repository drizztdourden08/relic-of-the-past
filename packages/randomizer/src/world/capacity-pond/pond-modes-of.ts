/* @layer shared-game @kind logic */
import { POND_MODES } from '../pond/pond-mode-switch';
import { anyFedFamilyInPool } from './any-fed-family-in-pool';
import type { PondMode } from '../pond/pond-profile.type';
import type { CapacityPondSelection } from './capacity-pond-rule.type';

const pondModesOf = (selection: CapacityPondSelection): readonly PondMode[] => {
  if (!selection.enabled) return POND_MODES.filter((mode) => mode === 'capacity');
  return anyFedFamilyInPool(selection) ? POND_MODES.filter((mode) => mode !== 'capacity') : POND_MODES;
};

export { pondModesOf };
