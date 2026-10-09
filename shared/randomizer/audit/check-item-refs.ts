/* @layer shared-game @kind logic */
import { NEEDS_RECEIVE_ID } from './invariant.constants';
import type { ItemRecord } from '../../game/data/types';
import type { InvariantFinding, InvariantInput } from './invariant.type';

const checkItemRefs = ({ checks, items }: InvariantInput): InvariantFinding[] => {
  const itemById = new Map<string, ItemRecord>(items.map((item) => [item.id, item]));
  const findings: InvariantFinding[] = [];

  for (const check of checks) {
    for (const itemId of check.vanillaItemIds) {
      const item = itemById.get(itemId);
      if (item === undefined) {
        findings.push({
          rule: 'A4-item', checkId: check.id, field: 'vanillaItemIds',
          detail: `item ${itemId} does not resolve to any item record`,
        });
        continue;
      }
      if (!NEEDS_RECEIVE_ID.includes(check.kind)) continue;
      const resolved = item.aliasOf !== undefined ? (itemById.get(item.aliasOf) ?? item) : item;
      if (resolved.gameId?.receiveItemId === undefined) {
        findings.push({
          rule: 'A4-item', checkId: check.id, field: 'vanillaItemIds',
          detail: `item ${itemId} (resolved ${resolved.id}) has no receiveItemId, required for kind ${check.kind}`,
        });
      }
    }
  }
  return findings;
};

export { checkItemRefs };
