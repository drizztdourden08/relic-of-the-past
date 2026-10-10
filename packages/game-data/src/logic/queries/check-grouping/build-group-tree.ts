/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import type { CheckStatus } from '../../check-status.type';
import { OUTSIDE_SWEEP } from './check-grouping.constants';
import type { GroupDimension, GroupingPass, GroupNode, RunContext } from './check-grouping.type';
import { getGroupValue } from './get-group-value';

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

const sphereRank = (label: string): number =>
  label === OUTSIDE_SWEEP ? Number.MAX_SAFE_INTEGER : Number(label.slice('Sphere '.length));

const isTrailingLabel = (label: string): boolean => label === 'Other' || label === 'Overworld';

const bucketChecks = (checks: CheckRecord[], dim: GroupDimension, run?: RunContext): Map<string, CheckRecord[]> => {
  const buckets = new Map<string, CheckRecord[]>();
  for (const check of checks) {
    const value = getGroupValue(check, dim, run);
    const bucket = buckets.get(value);
    if (bucket) bucket.push(check);
    else buckets.set(value, [check]);
  }
  return buckets;
};

const sortNodes = (nodes: GroupNode[], dim: GroupDimension): GroupNode[] => {
  if (dim === 'sphere') return nodes.sort((a, b) => sphereRank(a.label) - sphereRank(b.label));
  return nodes.sort((a, b) => {
    if (isTrailingLabel(a.label)) return 1;
    if (isTrailingLabel(b.label)) return -1;
    return a.label.localeCompare(b.label);
  });
};

const groupRecursive = (checks: CheckRecord[], depth: number, pass: GroupingPass): GroupNode[] => {
  const { dimensions, statuses, run } = pass;
  const dim = dimensions[depth];
  if (depth >= dimensions.length || dim === undefined) return [];

  const isLeaf = depth + 1 >= dimensions.length;
  const nodes: GroupNode[] = [];
  for (const [label, groupChecks] of bucketChecks(checks, dim, run)) {
    nodes.push({
      key: `${dim}:${label}`,
      label,
      children: isLeaf ? [] : groupRecursive(groupChecks, depth + 1, pass),
      checks: isLeaf ? groupChecks : [],
      stats: computeStats(groupChecks, statuses),
    });
  }
  return sortNodes(nodes, dim);
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

  root.children = groupRecursive(checks, 0, { dimensions, statuses, run });
  root.stats = computeStats(checks, statuses);
  return root;
};

export { buildGroupTree };
