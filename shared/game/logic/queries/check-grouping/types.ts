/* @layer shared-game @kind types */
import type { CheckRecord, ItemId } from '../../../data';
import type { RunKind } from '../../run-kind.type';

type GroupDimension = 'world' | 'area' | 'location' | 'dungeon' | 'screen' | 'type' | 'content' | 'sphere';

/**
 * What the run in progress adds to grouping, filtering and display: what each check holds,
 * and which sweep sphere reached it. The kind says how much of that is knowable, so a
 * surface showing a row never has to ask what mode the app is in.
 */
interface RunContext {
  /** Which run this is. Absent reads as the plain game, where every check holds its own contents. */
  kind?: RunKind;
  /** check id → the item record actually placed there. */
  placedItems?: ReadonlyMap<string, ItemId>;
  /** check id → verification-sweep sphere. */
  spheres?: ReadonlyMap<string, number>;
  /** check id → what a swap chest holds right now (chest-stand-ins.ts). Set on a normal profile too. */
  liveItems?: ReadonlyMap<string, ItemId>;
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
  /** Rows past a Big Key door wait for the key. Absent reads as on. */
  bigKeyDoors?: boolean;
  /**
   * Rows past a small key door wait for the keys the logic counts. Absent reads as off on the
   * plain game, which has never gated on key counts, and on for a seed (smallKeyDoorsOf).
   */
  smallKeyDoors?: boolean;
  /** Rows past an unlit room wait for a light the file accepts. Absent reads as on. */
  darkRoomsNeedLight?: boolean;
  /**
   * Shop shelves listed as rows on the plain game. Absent reads as off: a shelf is a shop
   * item to buy, not a check to hunt, until a seed makes it a location. A seed's roster
   * already holds only the shelves its shop scope opened, so this never touches one.
   */
  shopShelves?: boolean;
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
