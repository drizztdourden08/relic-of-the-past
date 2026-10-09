/* @layer renderer-components @kind types */
import type { DialogueEntry } from '@shared/game/language';
import type { EntryIssueMap } from '../language-editor.type';

type SelectParams = {
  entries: DialogueEntry[];
  filter: 'all' | 'warnings' | 'choices';
  issues: EntryIssueMap;
};

export type { SelectParams };
