/* @layer renderer-components @kind logic */
import type { DialogueEntry } from '@shared/game/language';

const countVariableUses = (entries: DialogueEntry[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const token of entry.tokens) {
      const key = token.t === 'ref' ? token.key : (token.t === 'var' ? token.name : null);
      if (key === null || seen.has(key)) continue;
      seen.add(key);
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
};

export { countVariableUses };
