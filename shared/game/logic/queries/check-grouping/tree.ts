/* @layer shared-game @kind logic */
/**
 * Builds the nested group tree (0-5 levels) for the tracker and aggregates
 * per-node completion stats.
 */
import type { CheckRecord } from '../../../data';
import type { CheckStatus } from '../../eval';
import type { GroupDimension, GroupNode, RunContext } from './types';
import { getGroupValue, OUTSIDE_SWEEP } from './dimensions';

const computeStats = (checks: CheckRecord[], statuses: Map<string, CheckStatus>): GroupNode['stats'] => {
  let completed = 0, reachable = 0, blocked = 0;
  for (const c of checks) {
    const s = statuses.get(c.id) ?? 'blocked';
    if (s === 'completed') completed++;
    else if (s === 'reachable') reachable++;
    else blocked++;
  }
  return { total: checks.length, completed, reachable, blocked };
};

/** Spheres are an ordered sequence, so they sort by number, not alphabetically. */
const sphereRank = (label: string): number =>
  label === OUTSIDE_SWEEP ? Number.MAX_SAFE_INTEGER : Number(label.slice('Sphere '.length));

const groupRecursive = (
  checks: CheckRecord[],
  dimensions: GroupDimension[],
  depth: number,
  statuses: Map<string, CheckStatus>,
  run?: RunContext
): GroupNode[] => {
  if (depth >= dimensions.length) return [];

  const dim = dimensions[depth];
  const buckets = new Map<string, CheckRecord[]>();

  for (const check of checks) {
    const value = getGroupValue(check, dim, run);
    if (!buckets.has(value)) buckets.set(value, []);
    buckets.get(value)!.push(check);
  }

  const nodes: GroupNode[] = [];
  for (const [label, groupChecks] of buckets) {
    const node: GroupNode = {
      key: `${dim}:${label}`,
      label,
      children: depth + 1 < dimensions.length
        ? groupRecursive(groupChecks, dimensions, depth + 1, statuses, run)
        : [],
      checks: depth + 1 >= dimensions.length ? groupChecks : [],
      stats: computeStats(groupChecks, statuses),
    };
    nodes.push(node);
  }

  if (dim === 'sphere') {
    nodes.sort((a, b) => sphereRank(a.label) - sphereRank(b.label));
    return nodes;
  }

  // Sort groups alphabetically, but put "Other" / "Overworld" last.
  nodes.sort((a, b) => {
    if (a.label === 'Other' || a.label === 'Overworld') return 1;
    if (b.label === 'Other' || b.label === 'Overworld') return -1;
    return a.label.localeCompare(b.label);
  });

  return nodes;
};

const buildGroupTree = (
  checks: CheckRecord[],
  statuses: Map<string, CheckStatus>,
  dimensions: GroupDimension[],
  run?: RunContext
): GroupNode => {
  const root: GroupNode = {
    key: 'root',
    label: 'All Checks',
    children: [],
    checks: [],
    stats: { total: 0, completed: 0, reachable: 0, blocked: 0 },
  };

  if (dimensions.length === 0) {
    root.checks = checks;
    root.stats = computeStats(checks, statuses);
    return root;
  }

  root.children = groupRecursive(checks, dimensions, 0, statuses, run);
  root.stats = computeStats(checks, statuses);
  return root;
};

export { buildGroupTree };
