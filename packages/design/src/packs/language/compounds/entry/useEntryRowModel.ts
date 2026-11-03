/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { entryRowModel } from './entry-row-model';
import type { EntryFactsProps, EntryRowModel } from './entry.type';

const useEntryRowModel = (props: EntryFactsProps): EntryRowModel => {
  const { entry, layout, variables, issues } = props;
  return useMemo(() => entryRowModel({
    entry, blocks: layout.blocks, lineCount: layout.lines.length, variables, issues,
  }), [entry, layout.blocks, layout.lines.length, variables, issues]);
};

export { useEntryRowModel };
