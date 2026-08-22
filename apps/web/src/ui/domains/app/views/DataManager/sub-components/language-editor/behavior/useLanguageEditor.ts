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
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GlossaryTerm, LanguageSet, Token } from '@shared/game/language';
import { getLanguageSet } from '@app/lib/storage/languages-store';
import type { LanguageEditorState, NameEdit } from '../language-editor.type';
import {
  withEntryNote, withEntryTokens, withGlossaryTerm, withNameValue, withoutGlossaryTerm,
} from './language-set-edits';
import { useEntryIssues } from './useEntryIssues';
import { useSetPersistence } from './useSetPersistence';

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

  const issues = useEntryIssues(set);

  return {
    set,
    loading,
    error,
    dirty,
    saving,
    saveError,
    issues,
    setEntryTokens,
    setEntryNote,
    setNameValue,
    upsertGlossaryTerm,
    removeGlossaryTerm,
    saveNow,
  };
};

export { useLanguageEditor };
