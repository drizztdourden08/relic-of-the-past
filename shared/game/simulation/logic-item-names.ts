/* @layer shared-game @kind logic */
/**
 * The set of inventory item names referenced anywhere in the traversal / check
 * logic rules (CHECK_RULES + SCREEN_RULES). Receiving one of these can change
 * whether a gated check becomes triggerable — boss gates, medallion checks,
 * pendant/crystal counts — so picking it up must trigger a reach re-flood even
 * when the item carries no direct traversal token.
 */
import type { Requirement } from '../types';
import { CHECK_RULES, SCREEN_RULES } from '../logic';
import { ITEM_GROUPS } from '../items/groups';

const collectItemNames = (req: Requirement, out: Set<string>): void => {
  if (typeof req === 'string') {
    out.add(req);
    return;
  }
  if ('and' in req) {
    for (const sub of req.and) collectItemNames(sub, out);
    return;
  }
  if ('or' in req) {
    for (const sub of req.or) collectItemNames(sub, out);
    return;
  }
  if ('count' in req) {
    const members = ITEM_GROUPS[req.count[0]];
    if (members) for (const name of members) out.add(name);
  }
};

const buildLogicReferencedItems = (): Set<string> => {
  const names = new Set<string>();
  for (const rule of Object.values(CHECK_RULES)) collectItemNames(rule, names);
  for (const rule of Object.values(SCREEN_RULES)) collectItemNames(rule, names);
  return names;
};

const LOGIC_REFERENCED_ITEMS: Set<string> = buildLogicReferencedItems();

export { LOGIC_REFERENCED_ITEMS, collectItemNames };
