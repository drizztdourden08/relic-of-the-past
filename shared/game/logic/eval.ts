/* @layer shared-game @kind logic */
import type { CheckRecord, ItemId, CheckId, Requirement } from '../data';
import { ITEM_GROUPS } from '../data';

// ─── A resolved traversal edge — a real connection (or the virtual menu spawn
// points), with its effective requirement (base record + any mode overlay)
// already attached. This is what resolver.ts hands to the functions below. ───

interface ReachConnection {
  from: string;
  to: string;
  requirements?: Requirement;
}

// ─── Requirement Evaluation ───

const evaluateRequirement = (
  req: Requirement,
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
): boolean => {
  if ('impossible' in req) return false;

  if ('itemId' in req) {
    return inventory.has(req.itemId);
  }

  if ('checkId' in req) {
    return completedChecks.has(req.checkId);
  }

  if ('allOf' in req) {
    return req.allOf.every(sub => evaluateRequirement(sub, inventory, completedChecks));
  }

  if ('anyOf' in req) {
    return req.anyOf.some(sub => evaluateRequirement(sub, inventory, completedChecks));
  }

  if ('count' in req) {
    const { groupId, n } = req.count;
    const members = ITEM_GROUPS[groupId];
    if (!members) return false;
    let count = 0;
    for (const item of members) {
      if (inventory.has(item)) count++;
      if (count >= n) return true;
    }
    return false;
  }

  return false;
};

// ─── Screen Reachability (BFS) ───

const getReachableScreens = (
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
  connections: readonly ReachConnection[],
): Set<string> => {
  const reachable = new Set<string>();
  const queue: string[] = ['menu'];
  reachable.add('menu');

  // Build adjacency list once
  const adj = new Map<string, ReachConnection[]>();
  for (const conn of connections) {
    let list = adj.get(conn.from);
    if (!list) {
      list = [];
      adj.set(conn.from, list);
    }
    list.push(conn);
  }

  const tryReach = (current: string): boolean => {
    let changed = false;
    const neighbors = adj.get(current);
    if (!neighbors) return changed;
    for (const edge of neighbors) {
      if (reachable.has(edge.to)) continue;
      if (edge.requirements && !evaluateRequirement(edge.requirements, inventory, completedChecks)) continue;
      reachable.add(edge.to);
      queue.push(edge.to);
      changed = true;
    }
    return changed;
  };

  while (queue.length > 0) {
    tryReach(queue.shift()!);
  }

  // Fixed-point: re-traverse until no new screens found.
  let changed = true;
  while (changed) {
    changed = false;
    for (const screenId of [...reachable]) {
      if (tryReach(screenId)) changed = true;
    }
  }

  return reachable;
};

// ─── Check Status ───

type CheckStatus = 'completed' | 'reachable' | 'blocked';

/** The check's requirement after any config-driven override (e.g. the pedestal's pendant count) is applied. */
const effectiveCheckRequirement = (
  check: CheckRecord,
  checkOverrides: Partial<Record<CheckId, Requirement>>,
): Requirement | undefined => checkOverrides[check.id] ?? check.requirements;

const getAccessibleChecks = (
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  connections: readonly ReachConnection[],
  checkOverrides: Partial<Record<CheckId, Requirement>>,
): CheckRecord[] => {
  const reachable = getReachableScreens(inventory, completedChecks, connections);

  return checks.filter(check => {
    if (completedChecks.has(check.id)) return false;
    if (!check.screenId || !reachable.has(check.screenId)) return false;

    const requirement = effectiveCheckRequirement(check, checkOverrides);
    if (requirement && !evaluateRequirement(requirement, inventory, completedChecks)) return false;

    return true;
  });
};

const getCheckStatus = (
  checkId: CheckId,
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  connections: readonly ReachConnection[],
  checkOverrides: Partial<Record<CheckId, Requirement>>,
): CheckStatus => {
  if (completedChecks.has(checkId)) return 'completed';

  const check = checks.find(c => c.id === checkId);
  if (!check) return 'blocked';

  const reachable = getReachableScreens(inventory, completedChecks, connections);
  if (!check.screenId || !reachable.has(check.screenId)) return 'blocked';

  const requirement = effectiveCheckRequirement(check, checkOverrides);
  if (requirement && !evaluateRequirement(requirement, inventory, completedChecks)) return 'blocked';

  return 'reachable';
};

/** Item ids still missing to satisfy `req`, given the current inventory. */
const getBlockingItems = (
  req: Requirement,
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
): ItemId[] => {
  if ('impossible' in req || 'checkId' in req) {
    return [];
  }

  if ('itemId' in req) {
    return inventory.has(req.itemId) ? [] : [req.itemId];
  }

  if ('allOf' in req) {
    const missing: ItemId[] = [];
    for (const sub of req.allOf) {
      if (!evaluateRequirement(sub, inventory, completedChecks)) {
        missing.push(...getBlockingItems(sub, inventory, completedChecks));
      }
    }
    return missing;
  }

  if ('anyOf' in req) {
    let best: ItemId[] | null = null;
    for (const sub of req.anyOf) {
      if (evaluateRequirement(sub, inventory, completedChecks)) return [];
      const items = getBlockingItems(sub, inventory, completedChecks);
      if (best === null || items.length < best.length) {
        best = items;
      }
    }
    return best ?? [];
  }

  if ('count' in req) {
    const { groupId, n } = req.count;
    const members = ITEM_GROUPS[groupId];
    if (!members) return [];
    const missing = members.filter(m => !inventory.has(m));
    const have = members.length - missing.length;
    const need = n - have;
    return need > 0 ? missing.slice(0, need) : [];
  }

  return [];
};

const computeTrackerSnapshot = (
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  connections: readonly ReachConnection[],
  checkOverrides: Partial<Record<CheckId, Requirement>>,
): Map<CheckId, CheckStatus> => {
  const reachable = getReachableScreens(inventory, completedChecks, connections);
  const result = new Map<CheckId, CheckStatus>();

  for (const check of checks) {
    if (completedChecks.has(check.id)) {
      result.set(check.id, 'completed');
      continue;
    }

    if (!check.screenId || !reachable.has(check.screenId)) {
      result.set(check.id, 'blocked');
      continue;
    }

    const requirement = effectiveCheckRequirement(check, checkOverrides);
    if (requirement && !evaluateRequirement(requirement, inventory, completedChecks)) {
      result.set(check.id, 'blocked');
      continue;
    }

    result.set(check.id, 'reachable');
  }

  return result;
};

export {
  computeTrackerSnapshot,
  evaluateRequirement,
  getAccessibleChecks,
  getBlockingItems,
  getCheckStatus,
  getReachableScreens,
};
export type { CheckStatus, ReachConnection };
