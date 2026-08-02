/* @layer shared-game @kind logic */
/**
 * What a Requirement tree names, whatever shape it happens to take.
 *
 * A requirement is recursive and its leaves point at three different
 * collections, so every reverse lookup that walks one would otherwise re-write
 * the same recursion with one leaf swapped. The walk lives here once; a caller
 * says which leaf it cares about.
 *
 * `PresenceCondition` is walked too, and separately, because it is a different
 * tree with different combinators (`and`/`or`/`not`) that happens to also carry
 * an `itemId` leaf — a check's spawn condition references an item just as
 * really as its requirements do.
 */
import type { PresenceCondition, Requirement } from '../types';

type RequirementLeaf = 'itemId' | 'checkId' | 'groupId';

/** Whether a requirement tree names this id at a leaf of the given kind. */
const requirementNames = (req: Requirement, leaf: RequirementLeaf, id: string): boolean => {
  if ('allOf' in req) return req.allOf.some(sub => requirementNames(sub, leaf, id));
  if ('anyOf' in req) return req.anyOf.some(sub => requirementNames(sub, leaf, id));
  if (leaf === 'groupId') return 'count' in req && req.count.groupId === id;
  if (leaf === 'itemId') return 'itemId' in req && req.itemId === id;
  return 'checkId' in req && req.checkId === id;
};

/** Whether a presence condition names this item id anywhere in its tree. */
const presenceNamesItem = (condition: PresenceCondition, id: string): boolean => {
  if ('and' in condition) return condition.and.some(sub => presenceNamesItem(sub, id));
  if ('or' in condition) return condition.or.some(sub => presenceNamesItem(sub, id));
  if ('not' in condition) return presenceNamesItem(condition.not, id);
  return 'itemId' in condition && condition.itemId === id;
};

export { presenceNamesItem, requirementNames };
export type { RequirementLeaf };
