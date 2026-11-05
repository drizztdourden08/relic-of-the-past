/* @layer renderer-lib @kind logic */
import { smallKeyDoorsOf } from '@rotp/game-data';
import type { FilterState } from '@rotp/game-data';
import { BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, SMALL_KEY_DOORS } from '@rotp/randomizer';
import type { RunKind } from './use-tracker-data.type';

const assumedIdsOf = (filter: FilterState, runKind: RunKind): string[] => {
  const ids: string[] = [];
  if (filter.bigKeyDoors ?? true) ids.push(BIG_KEY_DOORS);
  if (smallKeyDoorsOf(filter, { kind: runKind })) ids.push(SMALL_KEY_DOORS);
  if (filter.darkRoomsNeedLight ?? true) ids.push(DARK_ROOMS_NEED_LIGHT);
  return ids;
};

export { assumedIdsOf };
