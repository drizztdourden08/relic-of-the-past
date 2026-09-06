/* @layer shared-game @kind types */
import type { CheckRecord } from '../../../data';

type GroupDimension = 'world' | 'area' | 'location' | 'dungeon' | 'screen' | 'type' | 'content';

interface GroupDimensionDef {
  id: GroupDimension;
  label: string;
  description: string;
}

interface GroupNode {
  key: string;
  label: string;
  children: GroupNode[];
  checks: CheckRecord[];
  /** Aggregated counts from all descendant checks. */
  stats: { total: number; completed: number; reachable: number; blocked: number };
}

type ItemFilter = 'all' | 'rewards' | 'non-rewards';
type StatusFilter = 'all' | 'completed' | 'reachable' | 'blocked';

interface FilterState {
  searchQuery: string;
  /** Active ids from CHECK_FACET_DEFS, either a world/location/area facet or a real content TagId key. */
  activeFacets: string[];
  /** If true, check must match ALL active facets. If false, ANY. */
  tagMode: 'all' | 'any';
  /** Filter checks by whether they have an item reward. */
  itemFilter?: ItemFilter;
  /** Filter checks by their tracker status. */
  statusFilter?: StatusFilter;
}

export type {
  FilterState,
  GroupDimension,
  GroupDimensionDef,
  GroupNode,
  ItemFilter,
  StatusFilter,
};
