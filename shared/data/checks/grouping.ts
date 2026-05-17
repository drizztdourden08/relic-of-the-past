/**
 * Grouping engine for the tracker — allows users to nest checks by
 * world, area, location type, dungeon, region, etc.
 *
 * Supports 0-5 levels of nesting. Each level is a "grouping dimension".
 */

import type { CheckDefinition } from '../../types/tracker';
import type { CheckStatus } from '../../lib/logic-eval';
import type { CheckTag } from './tags';
import { getCheckTags, TAG_DEFINITIONS } from './tags';

// ─── Grouping dimensions ───

export type GroupDimension =
  | 'world'       // light_world / dark_world
  | 'area'        // kakariko, death_mountain, etc.
  | 'location'    // cave, house, dungeon, overworld
  | 'dungeon'     // specific dungeon name
  | 'region'      // the existing check.region field
  | 'type'        // check type (chest, npc, boss, etc.)
  | 'content';    // key, map_compass, boss_item, progression, junk

export interface GroupDimensionDef {
  id: GroupDimension;
  label: string;
  description: string;
}

export const GROUP_DIMENSIONS: GroupDimensionDef[] = [
  { id: 'world', label: 'World', description: 'Light World / Dark World' },
  { id: 'area', label: 'Area', description: 'Geographic region (Kakariko, Death Mountain, etc.)' },
  { id: 'location', label: 'Location Type', description: 'Cave, House, Dungeon, Overworld' },
  { id: 'dungeon', label: 'Dungeon', description: 'Specific dungeon' },
  { id: 'region', label: 'Region', description: 'Detailed sub-location' },
  { id: 'type', label: 'Check Type', description: 'Chest, NPC, Key Drop, Boss, etc.' },
  { id: 'content', label: 'Content', description: 'Key, Map/Compass, Boss Item, etc.' },
];

// ─── Group node tree ───

export interface GroupNode {
  key: string;
  label: string;
  children: GroupNode[];
  checks: CheckDefinition[];
  /** Aggregated counts from all descendant checks */
  stats: { total: number; completed: number; reachable: number; blocked: number };
}

// ─── Resolve group value for a check at a given dimension ───

function getGroupValue(check: CheckDefinition, dimension: GroupDimension, tags: CheckTag[]): string {
  switch (dimension) {
    case 'world':
      return tags.includes('dark_world') ? 'Dark World' : 'Light World';
    case 'area': {
      const areaTags = tags.filter(t =>
        TAG_DEFINITIONS.find(d => d.id === t && d.category === 'area')
      );
      if (areaTags.length > 0) {
        const def = TAG_DEFINITIONS.find(d => d.id === areaTags[0]);
        return def?.label ?? 'Other';
      }
      // For dungeon checks, use the dungeon name as area
      if (check.dungeon) return check.dungeon;
      return 'Other';
    }
    case 'location': {
      if (tags.includes('dungeon')) return 'Dungeon';
      if (tags.includes('cave')) return 'Cave';
      if (tags.includes('house')) return 'House';
      return 'Overworld';
    }
    case 'dungeon':
      return check.dungeon ?? 'Overworld';
    case 'region':
      return check.region;
    case 'type':
      return check.type.charAt(0).toUpperCase() + check.type.slice(1);
    case 'content': {
      if (tags.includes('key')) return 'Keys';
      if (tags.includes('big_key')) return 'Big Keys';
      if (tags.includes('map_compass')) return 'Map/Compass';
      if (tags.includes('boss_item')) return 'Boss Items';
      return 'Other';
    }
  }
}

// ─── Build grouped tree ───

export function buildGroupTree(
  checks: CheckDefinition[],
  statuses: Map<string, CheckStatus>,
  dimensions: GroupDimension[],
  tagMap: Map<string, CheckTag[]>,
): GroupNode {
  const root: GroupNode = {
    key: 'root',
    label: 'All Checks',
    children: [],
    checks: [],
    stats: { total: 0, completed: 0, reachable: 0, blocked: 0 },
  };

  if (dimensions.length === 0) {
    // Flat mode — all checks in root
    root.checks = checks;
    root.stats = computeStats(checks, statuses);
    return root;
  }

  // Build nested groups
  const grouped = groupRecursive(checks, dimensions, 0, tagMap, statuses);
  root.children = grouped;
  root.stats = computeStats(checks, statuses);
  return root;
}

function groupRecursive(
  checks: CheckDefinition[],
  dimensions: GroupDimension[],
  depth: number,
  tagMap: Map<string, CheckTag[]>,
  statuses: Map<string, CheckStatus>,
): GroupNode[] {
  if (depth >= dimensions.length) return [];

  const dim = dimensions[depth];
  const buckets = new Map<string, CheckDefinition[]>();

  for (const check of checks) {
    const tags = tagMap.get(check.id) ?? [];
    const value = getGroupValue(check, dim, tags);
    if (!buckets.has(value)) buckets.set(value, []);
    buckets.get(value)!.push(check);
  }

  const nodes: GroupNode[] = [];
  for (const [label, groupChecks] of buckets) {
    const node: GroupNode = {
      key: `${dim}:${label}`,
      label,
      children: depth + 1 < dimensions.length
        ? groupRecursive(groupChecks, dimensions, depth + 1, tagMap, statuses)
        : [],
      checks: depth + 1 >= dimensions.length ? groupChecks : [],
      stats: computeStats(groupChecks, statuses),
    };
    nodes.push(node);
  }

  // Sort groups alphabetically, but put "Other" / "Overworld" last
  nodes.sort((a, b) => {
    if (a.label === 'Other' || a.label === 'Overworld') return 1;
    if (b.label === 'Other' || b.label === 'Overworld') return -1;
    return a.label.localeCompare(b.label);
  });

  return nodes;
}

function computeStats(
  checks: CheckDefinition[],
  statuses: Map<string, CheckStatus>,
): GroupNode['stats'] {
  let completed = 0, reachable = 0, blocked = 0;
  for (const c of checks) {
    const s = statuses.get(c.id) ?? 'blocked';
    if (s === 'completed') completed++;
    else if (s === 'reachable') reachable++;
    else blocked++;
  }
  return { total: checks.length, completed, reachable, blocked };
}

// ─── Filter checks by tags and search query ───

export type ItemFilter = 'all' | 'rewards' | 'non-rewards';
export type StatusFilter = 'all' | 'completed' | 'reachable' | 'blocked';

export interface FilterState {
  searchQuery: string;
  activeTags: CheckTag[];
  /** If true, check must have ALL active tags. If false, ANY. */
  tagMode: 'all' | 'any';
  /** Filter checks by whether they have an item reward */
  itemFilter?: ItemFilter;
  /** Filter checks by their tracker status */
  statusFilter?: StatusFilter;
}

export function filterChecks(
  checks: CheckDefinition[],
  filter: FilterState,
  tagMap: Map<string, CheckTag[]>,
  statuses?: Map<string, CheckStatus>,
): CheckDefinition[] {
  let result = checks;

  // Filter by search query
  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      (c.dungeon?.toLowerCase().includes(q) ?? false) ||
      (Array.isArray(c.vanillaItem)
        ? c.vanillaItem.some(i => i.toLowerCase().includes(q))
        : (c.vanillaItem?.toLowerCase().includes(q) ?? false))
    );
  }

  // Filter by tags
  if (filter.activeTags.length > 0) {
    result = result.filter(c => {
      const checkTags = tagMap.get(c.id) ?? [];
      if (filter.tagMode === 'all') {
        return filter.activeTags.every(t => checkTags.includes(t));
      } else {
        return filter.activeTags.some(t => checkTags.includes(t));
      }
    });
  }

  // Filter by item reward
  if (filter.itemFilter === 'rewards') {
    result = result.filter(c => !!c.vanillaItem);
  } else if (filter.itemFilter === 'non-rewards') {
    result = result.filter(c => !c.vanillaItem);
  }

  // Filter by status
  if (filter.statusFilter && filter.statusFilter !== 'all' && statuses) {
    result = result.filter(c => {
      const status = statuses.get(c.id) ?? 'blocked';
      return status === filter.statusFilter;
    });
  }

  return result;
}
