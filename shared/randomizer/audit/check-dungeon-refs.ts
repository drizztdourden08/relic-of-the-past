/* @layer shared-game @kind logic */
import type { ItemRecord } from '@rotp/game-data';
import type { InvariantFinding, InvariantInput } from './invariant.type';

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

export { checkDungeonRefs };
