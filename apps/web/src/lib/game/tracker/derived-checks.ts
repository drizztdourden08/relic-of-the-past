/* @layer bridge-wasm @kind logic */
/**
 * The derived pass of the completion sweep: the records that are true because of other
 * records. A combined event names the records it is made of (`derived`), a dungeon-wide
 * event names a dungeon and the kinds it sums (`derivedDungeon`), and a ledger event an
 * older file cannot answer keeps a vanilla `fallback`. Records are visited in dataset
 * order, so a combined event only names records that come before it; one pass suffices.
 */
import { all, hasTagKey } from '@shared/game/data';
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import { evaluateRequirement } from '@shared/game/logic/eval';

const EMPTY_INVENTORY: ReadonlySet<ItemId> = new Set();

const dungeonMembers = (record: CheckRecord, checks: readonly CheckRecord[]): CheckRecord[] => {
  const rule = record.derivedDungeon;
  if (!rule) return [];
  return checks.filter((c) => c.dungeonId === rule.dungeonId && c.id !== record.id && c.kind !== 'event'
    && ((rule.kinds?.includes(c.kind) ?? false) || (rule.tag !== undefined && hasTagKey(c.tags ?? [], rule.tag))));
};

const resolveDerivedChecks = (
  completed: Set<CheckId>,
  inventory: ReadonlySet<ItemId> | null,
  checks: readonly CheckRecord[] = all('check'),
): Set<CheckId> => {
  const items = inventory ?? EMPTY_INVENTORY;
  for (const record of checks) {
    if (completed.has(record.id)) continue;
    if (record.derivedDungeon) {
      const members = dungeonMembers(record, checks);
      if (members.length > 0 && members.every((m) => completed.has(m.id))) completed.add(record.id);
      continue;
    }
    if (record.derived && evaluateRequirement(record.derived, items, completed)) { completed.add(record.id); continue; }
    if (record.fallback && evaluateRequirement(record.fallback, items, completed)) completed.add(record.id);
  }
  return completed;
};

export { resolveDerivedChecks };
