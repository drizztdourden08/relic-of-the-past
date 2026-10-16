/* @layer renderer-components @kind types */
import type { DialogueEntry, VariableIndex } from '@rotp/languages';
import type { LayoutLookup } from '@rotp/design/packs';
import type { EntryIssueMap, LanguageEditorState } from '../language-editor.type';
import type { EntryDraftState } from './entry-draft.type';

type DialogueViewParams = Pick<LanguageEditorState, 'set' | 'issues' | 'variables' | 'terms'> & {
  id: string | null;
  setEntryTokens: LanguageEditorState['setEntryTokens'];
};

type SelectionParams = {
  dialogue: DialogueEntry[];
  selected: number | null;
  layout: LayoutLookup;
  draft: EntryDraftState;
  variables: VariableIndex;
  issues: EntryIssueMap;
};

export type { DialogueViewParams, SelectionParams };
