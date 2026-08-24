/* @layer renderer-components @kind logic */
/**
 * Narrows the entry list to what a filter asks for, after search has already
 * had its say.
 *
 * "Needs attention" is the one a translator reaches for after importing a set:
 * it collects the lines that would fail to encode, which are invisible
 * otherwise until a save refuses them.
 */
import { contextFor } from '@shared/game/data/dialogue-context';
import type { DialogueEntry } from '@shared/game/language';
import type { EntryIssueMap } from '../language-editor.type';

type SelectParams = {
  entries: DialogueEntry[];
  filter: 'all' | 'warnings' | 'choices';
  issues: EntryIssueMap;
};

const selectEntries = (params: SelectParams): DialogueEntry[] => {
  const { entries, filter, issues } = params;
  if (filter === 'all') return entries;
  if (filter === 'warnings') {
    return entries.filter((entry) => (issues[entry.id]?.length ?? 0) > 0);
  }
  return entries.filter((entry) => Boolean(contextFor(entry.id)?.choice));
};

export { selectEntries };
export type { SelectParams };
