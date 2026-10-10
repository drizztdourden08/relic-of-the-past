/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GlossaryTerm, LanguageSet, SetStructure, TextGroupId, Token, Variable } from '@rotp/languages';
import { getLanguageSet } from '@app/storage/languages-store';
import { literalTermsOf, variablesOf } from '@rotp/design/packs';
import type { LanguageEditorState, NameEdit } from '../language-editor.type';
import {
  withEntryNote, withEntryTokens, withGlossaryTerm, withManyEntryTokens, withNameValue,
  withStructure, withTextValue,
  withoutGlossaryTerm,
} from './language-set-edits';
import { nameEditFor } from './variable-edits';
import { useEntryIssues } from './useEntryIssues';
import { useSetPersistence } from './useSetPersistence';
import { NO_TERMS, NO_VARIABLES } from './language-editor.constants';

const useLanguageEditor = (id: string | null, readOnly = false): LanguageEditorState => {
  const [set, setSet] = useState<LanguageSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<LanguageSet | null>(null);

  const { dirty, saving, saveError, markEdited, reset, saveNow } = useSetPersistence();

  const adopt = useCallback((loaded: LanguageSet | null) => {
    current.current = loaded;
    setSet(loaded);
    reset(loaded);
  }, [reset]);

  useEffect(() => {
    if (!id) { adopt(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLanguageSet(id)
      .then((loaded) => {
        if (cancelled) return;
        adopt(loaded);
        if (!loaded) setError(`Language set "${id}" was not found.`);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        adopt(null);
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [adopt, id]);

  const apply = useCallback((change: (from: LanguageSet) => LanguageSet) => {
    const from = current.current;
    if (!from || readOnly) return;
    const next = change(from);
    if (next === from) return;
    current.current = next;
    setSet(next);
    markEdited(next);
  }, [markEdited, readOnly]);

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

  const glossary = set?.glossary;
  const names = set?.names;
  const stored = set?.variables;
  const variables = useMemo(
    () => (glossary === undefined || names === undefined
      ? NO_VARIABLES
      : variablesOf(glossary, names, stored)),
    [glossary, names, stored],
  );
  const terms = useMemo(
    () => (variables === NO_VARIABLES ? NO_TERMS : literalTermsOf(variables)),
    [variables],
  );

  const setVariableValue = useCallback((variable: Variable, value: string) => {
    if (variable.locked || variable.value === null) return;
    if (variable.kind !== 'term') {
      apply((from) => withNameValue(from, nameEditFor(variable.key, value)));
      return;
    }
    const note = variable.note;
    const term: GlossaryTerm = note === undefined
      ? { key: variable.key, value }
      : { key: variable.key, value, note };
    apply((from) => withGlossaryTerm(from, term));
  }, [apply]);

  const issues = useEntryIssues(set, terms);

  return {
    set,
    loading,
    error,
    dirty,
    saving,
    saveError,
    issues,
    variables,
    terms,
    setEntryTokens,
    setEntryNote,
    setNameValue,
    setVariableValue,
    setManyEntryTokens,
    setStructureMode,
    setTextValue,
    upsertGlossaryTerm,
    removeGlossaryTerm,
    saveNow,
  };
};

export { useLanguageEditor };
