/* @layer renderer-components @kind hook */
import type { LanguageEditorState } from '../language-editor.type';
import { useEntryIssues } from './useEntryIssues';
import { useSetEdits } from './useSetEdits';
import { useSetLoader } from './useSetLoader';
import { useSetPersistence } from './useSetPersistence';
import { useSetVariables } from './useSetVariables';
import { useVariableValueSetter } from './useVariableValueSetter';

const useLanguageEditor = (id: string | null, readOnly = false): LanguageEditorState => {
  const { dirty, saving, saveError, markEdited, reset, saveNow } = useSetPersistence();
  const { set, setSet, current, loading, error } = useSetLoader(id, reset);
  const { apply, ...edits } = useSetEdits({ current, setSet, markEdited, readOnly });
  const { variables, terms } = useSetVariables(set);
  const setVariableValue = useVariableValueSetter(apply);
  const issues = useEntryIssues(set, terms);

  return {
    set, loading, error, dirty, saving, saveError, issues, variables, terms,
    ...edits, setVariableValue, saveNow,
  };
};

export { useLanguageEditor };
