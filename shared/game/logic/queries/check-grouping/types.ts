/* @layer shared-game @kind types */
import type { CheckRecord, CheckTag } from '../../../data';

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
  activeTags: CheckTag[];
  /** If true, check must have ALL active tags. If false, ANY. */
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
