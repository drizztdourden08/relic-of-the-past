/* @layer renderer-components @kind logic */
import { smallKeyDoorsOf } from '@shared/game/logic/queries/check-grouping';
import type { FilterState, RunContext } from '@shared/game/logic/queries/check-grouping';

const activeLogicToggles = (filter: FilterState, run?: RunContext): number =>
  ((filter.bigKeyDoors ?? true) ? 0 : 1) + ((filter.darkRoomsNeedLight ?? true) ? 0 : 1) + ((filter.shopShelves ?? false) ? 1 : 0)
  + (smallKeyDoorsOf(filter, run) === smallKeyDoorsOf({ ...filter, smallKeyDoors: undefined }, run) ? 0 : 1);

export { activeLogicToggles };
