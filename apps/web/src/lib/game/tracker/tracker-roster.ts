/* @layer bridge-wasm @kind logic */
import { placementCheckRecords, eventCheckRecords } from '../randomizer-client/virtual-locations';
import type { CheckRecord } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const trackerCheckRecords = (
  checkRecords: readonly CheckRecord[], placement: Placement | null,
): CheckRecord[] => {
  if (placement === null) return [...checkRecords];
  return [...placementCheckRecords(checkRecords, placement), ...eventCheckRecords(checkRecords)];
};

export { trackerCheckRecords };
