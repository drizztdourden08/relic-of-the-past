/* @layer shared-game @kind logic */
/**
 * Builds the nested group tree (0-5 levels) for the tracker and aggregates
 * per-node completion stats.
 */
import type { CheckDefinition } from '../../types';
import type { CheckStatus } from '../../logic/eval';
import type { CheckTag } from '../tags';
import type { GroupDimension, GroupNode } from './types';
import { getGroupValue } from './dimensions';

const computeStats = (checks: CheckDefinition[], statuses: Map<string, CheckStatus>): GroupNode['stats'] => {
  let completed = 0, reachable = 0, blocked = 0;
  for (const c of checks) {
    const s = statuses.get(c.id) ?? 'blocked';
    if (s === 'completed') completed++;
    else if (s === 'reachable') reachable++;
    else blocked++;
  }
  return { total: checks.length, completed, reachable, blocked };
};

const groupRecursive = (checks: CheckDefinition[], dimensions: GroupDimension[], depth: number, tagMap: Map<string, CheckTag[]>, statuses: Map<string, CheckStatus>): GroupNode[] => {
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
};

const buildGroupTree = (checks: CheckDefinition[], statuses: Map<string, CheckStatus>, dimensions: GroupDimension[], tagMap: Map<string, CheckTag[]>): GroupNode => {
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
};

export { buildGroupTree };
