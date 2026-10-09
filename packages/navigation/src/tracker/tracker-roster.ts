/* @layer bridge-wasm @kind logic */
import { placementCheckRecords, eventCheckRecords } from '@rotp/randomizer';
import type { CheckRecord } from '@rotp/game-data';
import type { Placement } from '@rotp/randomizer';

const trackerCheckRecords = (
  checkRecords: readonly CheckRecord[], placement: Placement | null,
): CheckRecord[] => {
  if (placement === null) return [...checkRecords];
  return [...placementCheckRecords(checkRecords, placement), ...eventCheckRecords(checkRecords)];
};

export { trackerCheckRecords };
