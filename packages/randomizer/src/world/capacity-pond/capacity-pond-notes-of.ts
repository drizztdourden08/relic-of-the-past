/* @layer shared-game @kind logic */
import { CAPACITY_POND_NOTES } from './capacity-pond-notes.constants';
import { anyFedFamilyInPool } from './any-fed-family-in-pool';
import { isPondActive } from './is-pond-active';
import type { CapacityPondSelection } from './capacity-pond-rule.type';

const capacityPondNotesOf = (selection: CapacityPondSelection): readonly string[] => {
  if (!selection.enabled) return [CAPACITY_POND_NOTES.off];
  const { retroBow } = selection;
  const notes: string[] = [];
  if (isPondActive(selection.pond))
    notes.push(retroBow ? CAPACITY_POND_NOTES.forcedInPoolRetro : CAPACITY_POND_NOTES.forcedInPool);
  if (anyFedFamilyInPool(selection))
    notes.push(retroBow ? CAPACITY_POND_NOTES.modeUnavailableRetro : CAPACITY_POND_NOTES.modeUnavailable);
  return notes;
};

export { capacityPondNotesOf };
