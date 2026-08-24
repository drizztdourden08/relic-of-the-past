/* @layer renderer-components @kind logic */
/**
 * Pure derivations the editor view needs: which entries a search is showing, and
 * how many entries lean on each variable.
 */
import type { DialogueEntry } from '@shared/game/language';
import type { SearchHit } from '../language-editor.type';

/**
 * Narrows the list to the entries a search matched. An empty applied query
 * means the search is not filtering, so every entry shows.
 */
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
 * How many entries use each variable, for the list's own counts.
 *
 * BOTH token shapes count. A variable of ours is referenced (`ref`), while one
 * the engine owns is a substitution code (`var`) — counting only the first would
 * report the two commonest variables in any set as unused. An entry that names
 * the same variable twice still counts once: the figure answers "how many lines
 * would a rename touch".
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
