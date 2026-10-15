/* @layer shared-game @kind types */
import type { CheckRecord, ItemId, ScreenRecord } from '../../../data';
import type { CheckStatus } from '../../check-status.type';
import type { RunKind } from '../../run-kind.type';

type GroupDimension = 'world' | 'area' | 'location' | 'dungeon' | 'screen' | 'type' | 'content' | 'sphere';

interface RunContext {
  kind?: RunKind;
  placedItems?: ReadonlyMap<string, ItemId>;
  foreignItems?: ReadonlyMap<string, string>;
  spheres?: ReadonlyMap<string, number>;
  liveItems?: ReadonlyMap<string, ItemId>;
}

type GroupValueOf = (check: CheckRecord, screen: ScreenRecord | undefined, run?: RunContext) => string;

interface GroupingPass {
  dimensions: GroupDimension[];
  statuses: Map<string, CheckStatus>;
  run?: RunContext;
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
  stats: { total: number; completed: number; reachable: number; blocked: number };
}

type ItemFilter = 'all' | 'rewards' | 'non-rewards';
type StatusFilter = 'all' | 'completed' | 'reachable' | 'blocked';
type ShowMode = 'items' | 'events' | 'both';

interface FilterState {
  searchQuery: string;
  activeFacets: string[];
  tagMode: 'all' | 'any';
  itemFilter?: ItemFilter;
  statusFilter?: StatusFilter;
  showMode?: ShowMode;
  bigKeyDoors?: boolean;
  smallKeyDoors?: boolean;
  darkRoomsNeedLight?: boolean;
  shopShelves?: boolean;
}

type CheckFacetCategory = 'world' | 'location' | 'area' | 'content';

interface CheckFacetDef {
  id: string;
  label: string;
  category: CheckFacetCategory;
}

export type {
  CheckFacetDef,
  FilterState,
  RunContext,
  GroupDimension,
  GroupDimensionDef,
  GroupingPass,
  GroupNode,
  GroupValueOf,
  ItemFilter,
  ShowMode,
  StatusFilter,
};
