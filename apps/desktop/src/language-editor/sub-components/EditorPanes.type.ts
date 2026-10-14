/* @layer renderer-components @kind types */
import type { useDialogueView } from '../behavior/useDialogueView';
import type { TextGroupsState } from '../behavior/text-groups.type';
import type { VariablesTabState } from '../behavior/variables-tab.type';
import type { LanguageEditorState } from '../language-editor.type';

type EditorPanesProps = {
  tab: string;
  readOnly: boolean;
  editor: LanguageEditorState;
  dialogue: ReturnType<typeof useDialogueView>['tabProps'];
  variablesTab: VariablesTabState;
  text: TextGroupsState;
};

export type { EditorPanesProps };
