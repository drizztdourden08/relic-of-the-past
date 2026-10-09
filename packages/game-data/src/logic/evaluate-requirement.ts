/* @layer shared-game @kind logic */
import { membersOf } from '../data';
import type { CheckId, ItemId, Requirement } from '../data';

const evaluateRequirement = (
  req: Requirement,
  inventory: ReadonlySet<ItemId>,
  completedChecks: ReadonlySet<CheckId>,
): boolean => {
  if ('impossible' in req) return false;
  if ('itemId' in req) return inventory.has(req.itemId);
  if ('checkId' in req) return completedChecks.has(req.checkId);
  if ('allOf' in req) return req.allOf.every((sub) => evaluateRequirement(sub, inventory, completedChecks));
  if ('anyOf' in req) return req.anyOf.some((sub) => evaluateRequirement(sub, inventory, completedChecks));
  if ('count' in req) {
    const { groupId, n } = req.count;
    let count = 0;
    for (const item of membersOf(groupId)) {
      if (inventory.has(item)) count += 1;
      if (count >= n) return true;
    }
    return false;
  }
  return false;
};

export { evaluateRequirement };
