/* @layer renderer-components @kind types */
import type { DialogueEntry } from '@rotp/languages';
import type { DialogueTabProps } from './DialogueTab.type';

type DialogueEntryRowProps = Omit<DialogueTabProps, 'entries' | 'total' | 'query' | 'filter' | 'onQueryChange' | 'onFilterChange'> & {
  entry: DialogueEntry;
};

export type { DialogueEntryRowProps };
