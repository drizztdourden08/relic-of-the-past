/* @layer shared-game @kind types */
import type { CheckDefinition } from '../../types';
import type { CheckTag } from '../tags';

// ─── Grouping dimensions ───

type GroupDimension =
  | 'world'       // light_world / dark_world
  | 'area'        // kakariko, death_mountain, etc.
  | 'location'    // cave, house, dungeon, overworld
  | 'dungeon'     // specific dungeon name
  | 'screen'      // the existing check.screen field
  | 'type'        // check type (chest, npc, boss, etc.)
  | 'content';    // key, map_compass, boss_item, progression, junk

interface GroupDimensionDef {
  id: GroupDimension;
  label: string;
  description: string;
}

// ─── Group node tree ───

interface GroupNode {
  key: string;
  label: string;
  children: GroupNode[];
  checks: CheckDefinition[];
  /** Aggregated counts from all descendant checks */
  stats: { total: number; completed: number; reachable: number; blocked: number };
}

// ─── Filter state ───

type ItemFilter = 'all' | 'rewards' | 'non-rewards';
type StatusFilter = 'all' | 'completed' | 'reachable' | 'blocked';

interface FilterState {
  searchQuery: string;
  activeTags: CheckTag[];
  /** If true, check must have ALL active tags. If false, ANY. */
  tagMode: 'all' | 'any';
  /** Filter checks by whether they have an item reward */
  itemFilter?: ItemFilter;
  /** Filter checks by their tracker status */
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
