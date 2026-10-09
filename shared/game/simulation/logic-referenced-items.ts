/* @layer shared-game @kind logic */
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

const logicReferencedItems: ReadonlySet<ItemId> = buildLogicReferencedItems();

export { logicReferencedItems };
