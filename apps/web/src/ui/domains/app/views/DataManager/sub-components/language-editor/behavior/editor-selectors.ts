/* @layer renderer-components @kind logic */
/**
 * Pure derivations the editor view needs: which entries a search is showing,
 * and how many entries lean on each glossary term.
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

/** How many entries reference each glossary key, for the term list's badges. */
const countGlossaryRefs = (entries: DialogueEntry[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const token of entry.tokens) {
      if (token.t !== 'ref' || seen.has(token.key)) continue;
      seen.add(token.key);
      counts[token.key] = (counts[token.key] ?? 0) + 1;
    }
  }
  return counts;
};

export { countGlossaryRefs, filterEntriesByHits };
