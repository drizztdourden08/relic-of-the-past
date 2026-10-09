/* @layer renderer-lib @kind constants */
import type { FilterState, GroupDimension } from '@rotp/game-data';

const EMPTY_FILTER: FilterState = { searchQuery: '', activeFacets: [], tagMode: 'any' };
const DEFAULT_GROUPING: GroupDimension[] = ['world', 'dungeon'];
const NO_GROUPS: readonly string[] = [];

export { DEFAULT_GROUPING, EMPTY_FILTER, NO_GROUPS };
