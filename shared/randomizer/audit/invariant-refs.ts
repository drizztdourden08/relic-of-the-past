/* @layer shared-game @kind logic */
/**
 * Reference integrity rules.
 *
 * A4-item — every vanillaItemIds entry must resolve to a real item record,
 * and for physically granted kinds the resolved item (one aliasOf hop) must
 * carry a native receive id.
 *
 * A5-dungeon — a check claiming a dungeon must sit on one of that dungeon's
 * room screens, and any dungeon-bound vanilla item must belong to the same
 * dungeon as the check.
 */
import type { CheckKind, ItemRecord } from '../../game/data/types';
import type { InvariantFinding, InvariantInput } from './invariant-types';

const NEEDS_RECEIVE_ID: readonly CheckKind[] = ['chest', 'keyDrop', 'potItem', 'standing'];

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

const checkDungeonRefs = ({ checks, items, dungeons }: InvariantInput): InvariantFinding[] => {
  const itemById = new Map<string, ItemRecord>(items.map((item) => [item.id, item]));
  const dungeonById = new Map(dungeons.map((dungeon) => [dungeon.id, dungeon]));
  const findings: InvariantFinding[] = [];

  for (const check of checks) {
    if (check.dungeonId === undefined) continue;
    const dungeon = dungeonById.get(check.dungeonId);
    if (dungeon === undefined) {
      findings.push({
        rule: 'A5-dungeon', checkId: check.id, field: 'dungeonId',
        detail: `dungeon ${check.dungeonId} does not resolve to any dungeon record`,
      });
      continue;
    }
    if (check.screenId === undefined || !dungeon.roomScreenIds.includes(check.screenId)) {
      findings.push({
        rule: 'A5-dungeon', checkId: check.id, field: 'screenId',
        detail: `screen ${check.screenId} is not among the room screens of ${check.dungeonId}`,
      });
    }
    for (const itemId of check.vanillaItemIds) {
      const item = itemById.get(itemId);
      if (item?.dungeonId !== undefined && item.dungeonId !== check.dungeonId) {
        findings.push({
          rule: 'A5-dungeon', checkId: check.id, field: 'vanillaItemIds',
          detail: `item ${itemId} belongs to ${item.dungeonId} but the check claims ${check.dungeonId}`,
        });
      }
    }
  }
  return findings;
};

export { checkDungeonRefs, checkItemRefs };
