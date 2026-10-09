/* @layer renderer-components @kind logic */
import type { DialogueEntry } from '@rotp/languages';
import type { SearchHit } from '../translation-search.type';

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

export { filterEntriesByHits };
