/* @layer renderer-lib @kind constants */
import type { CheckId, CheckStatus, FilterState, GroupDimension, ItemId } from '@rotp/game-data';
import type { LocationStatus } from '@drizztdourden08/brock-randomizer/tracker';

const EMPTY_FILTER: FilterState = { searchQuery: '', activeFacets: [], tagMode: 'any' };
const DEFAULT_GROUPING: GroupDimension[] = ['world', 'dungeon'];
const NO_GROUPS: readonly string[] = [];
const NO_ITEMS: ReadonlySet<ItemId> = new Set();
const NO_COMPLETED: ReadonlySet<CheckId> = new Set();
const CHECK_STATUS_OF: Readonly<Record<LocationStatus, CheckStatus>> = {
  checked: 'completed', available: 'reachable', blocked: 'blocked',
};

export { CHECK_STATUS_OF, DEFAULT_GROUPING, EMPTY_FILTER, NO_COMPLETED, NO_GROUPS, NO_ITEMS };
