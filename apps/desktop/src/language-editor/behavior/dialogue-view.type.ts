/* @layer renderer-components @kind types */
import type { LanguageEditorState } from '../language-editor.type';

type DialogueViewParams = Pick<LanguageEditorState, 'set' | 'issues' | 'variables' | 'terms'> & {
  id: string | null;
  setEntryTokens: LanguageEditorState['setEntryTokens'];
};

export type { DialogueViewParams };
