/* @layer bridge-wasm @kind logic */
import { all, hasTagKey, evaluateRequirement } from '@rotp/game-data';
import type { CheckId, CheckRecord, ItemId } from '@rotp/game-data';
import { EMPTY_INVENTORY } from './derived-checks.constants';

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
  armed: ReadonlySet<CheckId> = new Set(),
): Set<CheckId> => {
  const items = inventory ?? EMPTY_INVENTORY;
  for (const record of checks) {
    if (completed.has(record.id) || armed.has(record.id)) continue;
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
