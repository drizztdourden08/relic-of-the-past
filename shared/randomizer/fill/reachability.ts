/* @layer shared-game @kind logic */
/**
 * Bridge between the fill algorithms and the logic engine. The engine keeps
 * ITEM ids and CHECK ids in two separate sets (eval.ts's inventory /
 * completedChecks pair), and everything here mirrors that convention exactly.
 * A check with no screenId is location-unconstrained: only its requirements
 * gate it (the fill's convention for pure progress events).
 */
import type { CheckId, CheckRecord, ItemId, Requirement } from '@shared/game/data';
import { evaluateRequirement, getReachableScreens } from '@shared/game/logic/eval';
import type { ResolvedRules } from '@shared/game/logic/resolver';
import type { SpoilerSphere } from '../placement.type';

interface SphereWalkInput {
  /** CheckId -> the item the fill has assigned there. */
  assignments: ReadonlyMap<CheckId, ItemId>;
  /** The full walk list: every check that can grant items or progress flags. */
  checks: readonly CheckRecord[];
  startInventory: ReadonlySet<ItemId>;
  rules: ResolvedRules;
  /**
   * Ids whose vanilla contents are replaced by the fill, where an unassigned one
   * grants nothing when collected. Defaults to the assignment keys.
   */
  randomizedIds?: ReadonlySet<CheckId>;
}

interface SphereWalkResult {
  spheres: SpoilerSphere[];
  /** Every randomized check was collected. */
  collectedAll: boolean;
  inventory: Set<ItemId>;
  completedChecks: Set<CheckId>;
}

const effectiveRequirement = (check: CheckRecord, rules: ResolvedRules): Requirement | undefined =>
  rules.checkOverrides[check.id] ?? check.requirements;

/** Screen reachable (or no screen) and requirements satisfied: collectable in the current pass. */
const isCollectable = (
  check: CheckRecord,
  reachable: ReadonlySet<string>,
  inventory: ReadonlySet<ItemId>,
  completed: ReadonlySet<CheckId>,
  rules: ResolvedRules,
): boolean => {
  if (check.screenId !== undefined && !reachable.has(check.screenId)) return false;
  const requirement = effectiveRequirement(check, rules);
  return requirement === undefined || evaluateRequirement(requirement, inventory, completed);
};

/**
 * Sphere-aware "collectable right now": the item inventory is FIXED, but
 * collected check ids feed back into the reachability fixpoint (progress
 * events unlock edges and other checks' requirements).
 */
const collectibleChecks = (
  checks: readonly CheckRecord[],
  ownedItemIds: ReadonlySet<ItemId>,
  rules: ResolvedRules,
): Set<CheckId> => {
  const inventory = new Set<ItemId>([...rules.startInventory, ...ownedItemIds]);
  const completed = new Set<CheckId>();
  let changed = true;
  while (changed) {
    changed = false;
    const reachable = getReachableScreens(inventory, completed, rules.connections);
    for (const check of checks) {
      if (completed.has(check.id)) continue;
      if (!isCollectable(check, reachable, inventory, completed, rules)) continue;
      completed.add(check.id);
      changed = true;
    }
  }
  return completed;
};

/**
 * Full playthrough simulation: repeatedly collect every collectable check,
 * granting its assigned item (or its vanilla items when it is not part of the
 * randomized domain) until no progress remains. Each pass that yields at
 * least one assigned item is recorded as a spoiler sphere.
 */
const sphereWalk = ({ assignments, checks, startInventory, rules, randomizedIds }: SphereWalkInput): SphereWalkResult => {
  const inventory = new Set<ItemId>([...rules.startInventory, ...startInventory]);
  const completed = new Set<CheckId>();
  const spheres: SpoilerSphere[] = [];
  const randomized = randomizedIds ?? new Set(assignments.keys());

  for (;;) {
    const reachable = getReachableScreens(inventory, completed, rules.connections);
    const newly = checks.filter((c) => !completed.has(c.id) && isCollectable(c, reachable, inventory, completed, rules));
    if (newly.length === 0) break;

    const entries: SpoilerSphere['entries'] = [];
    for (const check of newly) {
      completed.add(check.id);
      const assigned = assignments.get(check.id);
      if (assigned !== undefined) {
        inventory.add(assigned);
        entries.push({ checkId: check.id, itemId: assigned });
      } else if (!randomized.has(check.id)) {
        for (const itemId of check.vanillaItemIds) inventory.add(itemId);
      }
    }
    if (entries.length > 0) spheres.push({ index: spheres.length, entries });
  }

  const collectedAll = checks.every((c) => !randomized.has(c.id) || completed.has(c.id));
  return { spheres, collectedAll, inventory, completedChecks: completed };
};

export { collectibleChecks, sphereWalk };
export type { SphereWalkInput, SphereWalkResult };
