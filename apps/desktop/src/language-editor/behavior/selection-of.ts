/* @layer renderer-components @kind logic */
import type { EntryFactsProps } from '@rotp/design/packs';
import type { SelectionParams } from './dialogue-view.type';

const selectionOf = (params: SelectionParams): EntryFactsProps | null => {
  const { dialogue, selected, layout, draft, variables, issues } = params;
  const entry = selected === null ? undefined : dialogue.find((candidate) => candidate.id === selected);
  if (entry === undefined) return null;

  const drafted = draft.tokensOf(entry.id);
  const entryLayout = drafted === null ? layout.layoutFor(entry) : layout.layoutOf(drafted);
  return { entry, layout: entryLayout, variables, issues: issues[entry.id] };
};

export { selectionOf };
