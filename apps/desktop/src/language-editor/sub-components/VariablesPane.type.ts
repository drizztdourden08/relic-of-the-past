/* @layer renderer-components @kind types */
import type { LanguageEditorState } from '../language-editor.type';
import type { VariablesTabState } from '../behavior/variables-tab.type';

type VariablesPaneProps = Pick<LanguageEditorState, 'variables' | 'setVariableValue' | 'upsertGlossaryTerm' | 'removeGlossaryTerm'> & {
  tab: VariablesTabState;
  readOnly: boolean;
};

export type { VariablesPaneProps };
