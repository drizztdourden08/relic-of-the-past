/* @layer renderer-components @kind types */
import type { DialogueEntry } from '@rotp/languages';
import type { EntryIssueMap } from '../language-editor.type';

type SelectParams = {
  entries: DialogueEntry[];
  filter: 'all' | 'warnings' | 'choices';
  issues: EntryIssueMap;
};

export type { SelectParams };
