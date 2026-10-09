/* @layer renderer-components @kind logic */
import { contextFor } from '@shared/game/data/dialogue-context';
import type { DialogueEntry } from '@shared/game/language';
import type { SelectParams } from './select-entries.type';

const selectEntries = (params: SelectParams): DialogueEntry[] => {
  const { entries, filter, issues } = params;
  if (filter === 'all') return entries;
  if (filter === 'warnings') {
    return entries.filter((entry) => (issues[entry.id]?.length ?? 0) > 0);
  }
  return entries.filter((entry) => Boolean(contextFor(entry.id)?.choice));
};

export { selectEntries };
