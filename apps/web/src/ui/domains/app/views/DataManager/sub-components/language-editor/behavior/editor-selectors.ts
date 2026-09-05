/* @layer renderer-components @kind logic */
import type { DialogueEntry } from '@shared/game/language';
import type { SearchHit } from '../language-editor.type';

/** The entries a search matched; an empty applied query shows every entry. */
const filterEntriesByHits = (
  entries: DialogueEntry[],
  hits: SearchHit[],
  applied: string,
): DialogueEntry[] => {
  if (applied.length === 0) return entries;
  const matched = new Set<number>();
  for (const hit of hits) {
    if (hit.entryId !== null) matched.add(hit.entryId);
  }
  return entries.filter((entry) => matched.has(entry.id));
};

/**
 * How many entries use each variable. Both `ref` (ours) and `var` (engine
 * substitution codes) count, and an entry naming the same variable twice
 * counts once: the figure answers "how many lines would a rename touch".
 */
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

export { countVariableUses, filterEntriesByHits };
