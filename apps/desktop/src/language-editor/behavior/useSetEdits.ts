/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { GlossaryTerm, SetStructure, TextGroupId, Token } from '@rotp/languages';
import type { NameEdit } from '../language-editor.type';
import {
  withEntryNote, withEntryTokens, withGlossaryTerm, withManyEntryTokens, withNameValue,
  withStructure, withTextValue,
  withoutGlossaryTerm,
} from './language-set-edits';
import type { SetApply, SetEditsParams } from './set-edits.type';

const useSetEdits = (params: SetEditsParams) => {
  const { current, setSet, markEdited, readOnly } = params;

  const apply: SetApply = useCallback((change) => {
    const from = current.current;
    if (!from || readOnly) return;
    const next = change(from);
    if (next === from) return;
    current.current = next;
    setSet(next);
    markEdited(next);
  }, [current, setSet, markEdited, readOnly]);

  const setEntryTokens = useCallback((entryId: number, tokens: Token[]) => {
    apply((from) => withEntryTokens(from, entryId, tokens));
  }, [apply]);

  const setEntryNote = useCallback((entryId: number, note: string) => {
    apply((from) => withEntryNote(from, entryId, note));
  }, [apply]);

  const setNameValue = useCallback((edit: NameEdit) => {
    apply((from) => withNameValue(from, edit));
  }, [apply]);

  const upsertGlossaryTerm = useCallback((term: GlossaryTerm) => {
    apply((from) => withGlossaryTerm(from, term));
  }, [apply]);

  const removeGlossaryTerm = useCallback((key: string) => {
    apply((from) => withoutGlossaryTerm(from, key));
  }, [apply]);

  const setManyEntryTokens = useCallback((edits: { entryId: number; tokens: Token[] }[]) => {
    apply((from) => withManyEntryTokens(from, edits));
  }, [apply]);

  const setStructureMode = useCallback((mode: SetStructure) => {
    apply((from) => withStructure(from, mode));
  }, [apply]);

  const setTextValue = useCallback((group: TextGroupId, key: string, value: string) => {
    apply((from) => withTextValue(from, group, key, value));
  }, [apply]);

  return {
    apply, setEntryTokens, setEntryNote, setNameValue, upsertGlossaryTerm, removeGlossaryTerm,
    setManyEntryTokens, setStructureMode, setTextValue,
  };
};

export { useSetEdits };
