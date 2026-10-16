/* @layer renderer-components @kind logic */
import { contextFor } from '@rotp/game-data';
import type { DialogueEntry, VariableIndex } from '@rotp/languages';
import type { EntryLayout } from '../../behavior/language-behavior.type';
import { entryMetaRows } from './entry-meta-model';
import { factsForEntry } from './facts-for-entry';
import type { MetaRow } from './entry.type';

const metaRowsForEntry = (entry: DialogueEntry, layout: EntryLayout, variables: VariableIndex): MetaRow[] => entryMetaRows({
  tokens: entry.tokens,
  facts: factsForEntry(entry.id),
  context: contextFor(entry.id) ?? null,
  blocks: layout.blocks,
  lineCount: layout.lines.length,
  variables,
});

export { metaRowsForEntry };
