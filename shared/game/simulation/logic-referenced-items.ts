/* @layer shared-game @kind logic */
/**
 * The items referenced anywhere in the check/connection requirement graph
 * (`CheckRecord.requirements` + `ConnectionRecord.requirements`). Receiving one
 * of these can change whether a gated check becomes triggerable — boss gates,
 * medallion checks, pendant/crystal counts — so picking it up must trigger a
 * reach re-flood even when the item carries no direct traversal token.
 *
 * The requirement graph is id-based and so is this set. It used to resolve every
 * id to a display name on the way out, purely because the simulator's inventory
 * was a name set; with the inventory keyed by id that step is gone, and with it
 * the chance of two records collapsing onto one shared name.
 */
import type { ItemId, Requirement } from '../data';
import { find, membersOf } from '../data';

const collectItemIds = (req: Requirement, out: Set<ItemId>): void => {
  if ('impossible' in req || 'checkId' in req) return;

  if ('itemId' in req) {
    out.add(req.itemId);
    return;
  }

  if ('allOf' in req) {
    for (const sub of req.allOf) collectItemIds(sub, out);
    return;
  }

  if ('anyOf' in req) {
    for (const sub of req.anyOf) collectItemIds(sub, out);
    return;
  }

  if ('count' in req) {
    for (const id of membersOf(req.count.groupId)) out.add(id);
  }
};

const buildLogicReferencedItems = (): Set<ItemId> => {
  const ids = new Set<ItemId>();
  for (const check of find('check', () => true)) {
    if (check.requirements) collectItemIds(check.requirements, ids);
  }
  for (const connection of find('connection', () => true)) {
    if (connection.requirements) collectItemIds(connection.requirements, ids);
  }
  return ids;
};

const LOGIC_REFERENCED_ITEMS: ReadonlySet<ItemId> = buildLogicReferencedItems();

export { LOGIC_REFERENCED_ITEMS };
