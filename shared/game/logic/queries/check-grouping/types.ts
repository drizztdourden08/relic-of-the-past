/* @layer shared-game @kind types */
import type { CheckRecord, ItemId } from '../../../data';

type GroupDimension = 'world' | 'area' | 'location' | 'dungeon' | 'screen' | 'type' | 'content' | 'sphere';

/**
 * What a randomized RUN adds to grouping, filtering and display: what each
 * check actually holds this seed, and which sweep sphere reached it. Absent on
 * a vanilla profile, where every check shows its own contents.
 */
interface RunContext {
  /** check id → the item record actually placed there. */
  placedItems?: ReadonlyMap<string, ItemId>;
  /** check id → verification-sweep sphere. */
  spheres?: ReadonlyMap<string, number>;
}

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
/** What the tracker lists: the item checks, the events, or both. */
type ShowMode = 'items' | 'events' | 'both';

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
  /** Items, events, or both. Absent reads as items, the list as it always was. */
  showMode?: ShowMode;
}

export type {
  FilterState,
  RunContext,
  GroupDimension,
  GroupDimensionDef,
  GroupNode,
  ItemFilter,
  ShowMode,
  StatusFilter,
};
