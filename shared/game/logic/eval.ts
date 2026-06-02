import type { Requirement, CheckDefinition, ScreenConnection } from '../types';
import { ITEM_GROUPS } from '../items/groups';

// ─── Requirement Evaluation ───

/**
 * Evaluate a Requirement expression tree against an inventory set.
 * Returns true if the requirement is satisfied.
 */
function evaluateRequirement(
  req: Requirement,
  inventory: Set<string>,
): boolean {
  if (typeof req === 'string') {
    return inventory.has(req);
  }

  if ('and' in req) {
    return req.and.every(sub => evaluateRequirement(sub, inventory));
  }

  if ('or' in req) {
    return req.or.some(sub => evaluateRequirement(sub, inventory));
  }

  if ('count' in req) {
    const [group, n] = req.count;
    const members = ITEM_GROUPS[group];
    if (!members) return false;
    let count = 0;
    for (const item of members) {
      if (inventory.has(item)) count++;
      if (count >= n) return true;
    }
    return false;
  }

  return false;
}

// ─── Screen Reachability (BFS) ───

/**
 * Starting from 'Menu', BFS through the screen graph following connections
 * whose entrance rules are satisfied by the current inventory.
 */
function getReachableScreens(
  inventory: Set<string>,
  connections: ScreenConnection[],
  screenRules: Record<string, Requirement>,
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = ['menu'];
  reachable.add('menu');

  // Build adjacency list once
  const adj = new Map<string, string[]>();
  for (const conn of connections) {
    let list = adj.get(conn.from);
    if (!list) {
      list = [];
      adj.set(conn.from, list);
    }
    list.push(conn.to);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current);
    if (!neighbors) continue;

    for (const to of neighbors) {
      if (reachable.has(to)) continue;

      const rule = screenRules[`${current}|${to}`];
      if (rule && !evaluateRequirement(rule, inventory)) continue;

      reachable.add(to);
      queue.push(to);
    }
  }

  // Fixed-point: re-traverse until no new screens found.
  let changed = true;
  while (changed) {
    changed = false;
    for (const screenId of reachable) {
      const neighbors = adj.get(screenId);
      if (!neighbors) continue;
      for (const to of neighbors) {
        if (reachable.has(to)) continue;
        const rule = screenRules[`${screenId}|${to}`];
        if (rule && !evaluateRequirement(rule, inventory)) continue;
        reachable.add(to);
        queue.push(to);
        changed = true;
      }
    }
  }

  return reachable;
}

// ─── Check Status ───

type CheckStatus = 'completed' | 'reachable' | 'blocked';

/**
 * Get all accessible checks: those in reachable screens whose local rules are satisfied.
 */
function getAccessibleChecks(
  inventory: Set<string>,
  completedChecks: Set<string>,
  checks: CheckDefinition[],
  connections: ScreenConnection[],
  screenRules: Record<string, Requirement>,
  checkRules: Record<string, Requirement>,
): CheckDefinition[] {
  const reachable = getReachableScreens(inventory, connections, screenRules);

  return checks.filter(check => {
    if (completedChecks.has(check.id)) return false;
    if (!reachable.has(check.screen)) return false;

    const localRule = checkRules[check.id];
    if (localRule && !evaluateRequirement(localRule, inventory)) return false;

    return true;
  });
}

/**
 * Get the status of a single check.
 */
function getCheckStatus(
  checkId: string,
  inventory: Set<string>,
  completedChecks: Set<string>,
  checks: CheckDefinition[],
  connections: ScreenConnection[],
  screenRules: Record<string, Requirement>,
  checkRules: Record<string, Requirement>,
): CheckStatus {
  if (completedChecks.has(checkId)) return 'completed';

  const check = checks.find(c => c.id === checkId);
  if (!check) return 'blocked';

  const reachable = getReachableScreens(inventory, connections, screenRules);
  if (!reachable.has(check.screen)) return 'blocked';

  const localRule = checkRules[checkId];
  if (localRule && !evaluateRequirement(localRule, inventory)) return 'blocked';

  return 'reachable';
}

/**
 * For a blocked check, find the immediate missing items from its requirement tree.
 */
function getBlockingItems(
  req: Requirement,
  inventory: Set<string>,
): string[] {
  if (typeof req === 'string') {
    return inventory.has(req) ? [] : [req];
  }

  if ('and' in req) {
    const missing: string[] = [];
    for (const sub of req.and) {
      if (!evaluateRequirement(sub, inventory)) {
        missing.push(...getBlockingItems(sub, inventory));
      }
    }
    return missing;
  }

  if ('or' in req) {
    let best: string[] | null = null;
    for (const sub of req.or) {
      if (evaluateRequirement(sub, inventory)) return [];
      const items = getBlockingItems(sub, inventory);
      if (best === null || items.length < best.length) {
        best = items;
      }
    }
    return best ?? [];
  }

  if ('count' in req) {
    const [group, n] = req.count;
    const members = ITEM_GROUPS[group];
    if (!members) return [`${n}x ${group}`];
    const missing = members.filter(m => !inventory.has(m));
    const have = members.length - missing.length;
    const need = n - have;
    return need > 0 ? missing.slice(0, need) : [];
  }

  return [];
}

/**
 * Full tracker snapshot: compute status for every check.
 */
function computeTrackerSnapshot(
  inventory: Set<string>,
  completedChecks: Set<string>,
  checks: CheckDefinition[],
  connections: ScreenConnection[],
  screenRules: Record<string, Requirement>,
  checkRules: Record<string, Requirement>,
): Map<string, CheckStatus> {
  const reachable = getReachableScreens(inventory, connections, screenRules);
  const result = new Map<string, CheckStatus>();

  for (const check of checks) {
    if (completedChecks.has(check.id)) {
      result.set(check.id, 'completed');
      continue;
    }

    if (!reachable.has(check.screen)) {
      result.set(check.id, 'blocked');
      continue;
    }

    const localRule = checkRules[check.id];
    if (localRule && !evaluateRequirement(localRule, inventory)) {
      result.set(check.id, 'blocked');
      continue;
    }

    result.set(check.id, 'reachable');
  }

  return result;
}

export {
  computeTrackerSnapshot,
  evaluateRequirement,
  getAccessibleChecks,
  getBlockingItems,
  getCheckStatus,
  getReachableScreens
};
export type { CheckStatus };
