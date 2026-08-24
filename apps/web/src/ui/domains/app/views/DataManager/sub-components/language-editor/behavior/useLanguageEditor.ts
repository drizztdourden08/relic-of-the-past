/* @layer renderer-components @kind hook */
/**
 * The translation editor's data layer: loads one language set by id, holds it
 * in memory while it is edited, validates it live, and persists it on a
 * debounce.
 *
 * Reads and writes go through the renderer languages store rather than
 * window.api, which is the convention every other data view here follows: the
 * store is bound to the platform FileStore, so the same call works on the
 * desktop host and on the portable/browser host (where window.api is only a
 * boot-safe stub).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  GlossaryTerm, LanguageSet, SetStructure, TextGroupId, Token, Variable,
} from '@shared/game/language';
import { mergeVariableMeta, variablesFromLegacy } from '@shared/game/language';
import { getLanguageSet } from '@app/lib/storage/languages-store';
import type { LanguageEditorState, NameEdit } from '../language-editor.type';
import {
  withEntryNote, withEntryTokens, withGlossaryTerm, withManyEntryTokens, withNameValue,
  withStructure, withTextValue,
  withoutGlossaryTerm,
} from './language-set-edits';
import { nameEditFor } from './variable-edits';
import { useEntryIssues } from './useEntryIssues';
import { useSetPersistence } from './useSetPersistence';

const NO_VARIABLES: Variable[] = [];
const NO_TERMS: GlossaryTerm[] = [];

/** Every variable carrying literal text, as the walks that expand refs take it. */
const literalTermsOf = (variables: Variable[]): GlossaryTerm[] => variables.flatMap(
  (variable) => (variable.value === null ? [] : [{ key: variable.key, value: variable.value }]),
);

const useLanguageEditor = (id: string | null): LanguageEditorState => {
  const [set, setSet] = useState<LanguageSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mirrors `set` so an edit can read the current value without depending on it.
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

  /** Applies one immutable transform, then marks the result for a debounced write. */
  const apply = useCallback((change: (from: LanguageSet) => LanguageSet) => {
    const from = current.current;
    if (!from) return;
    const next = change(from);
    if (next === from) return;
    current.current = next;
    setSet(next);
    markEdited(next);
  }, [markEdited]);

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

  /*
   * The stored pair, folded into the one list the UI edits. `mergeVariableMeta`
   * carries over the fields the pair cannot hold (a label, a note on a menu
   * name), exactly as the write path does, so what is shown here is what a save
   * will persist.
   */
  const glossary = set?.glossary;
  const names = set?.names;
  const stored = set?.variables;
  /*
   * Keyed on the three fields it is built from, NOT on the set. Every dialogue
   * edit produces a new set while leaving these three untouched, and a new
   * variable list on each keystroke would invalidate the layout cache for the
   * whole set — a few hundred entries re-measured per character typed.
   */
  const variables = useMemo(
    () => (glossary === undefined || names === undefined
      ? NO_VARIABLES
      : mergeVariableMeta(variablesFromLegacy(glossary, names), stored)),
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
