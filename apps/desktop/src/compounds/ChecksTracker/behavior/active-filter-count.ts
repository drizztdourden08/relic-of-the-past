/* @layer renderer-components @kind logic */
import type { FilterState, GroupDimension, RunContext } from '@rotp/game-data';
import { activeLogicToggles } from './active-logic-toggles';

const flag = (on: boolean): number => (on ? 1 : 0);

const activeFilterCount = (filter: FilterState, grouping: readonly GroupDimension[], run?: RunContext): number =>
  flag((filter.itemFilter ?? 'all') !== 'all')
  + flag((filter.statusFilter ?? 'all') !== 'all')
  + activeLogicToggles(filter, run)
  + flag(filter.activeFacets.length > 0)
  + flag(grouping.length > 0);

export { activeFilterCount };
