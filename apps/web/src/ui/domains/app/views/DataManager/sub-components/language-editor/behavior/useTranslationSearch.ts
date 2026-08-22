/* @layer renderer-components @kind hook */
/**
 * Full-set search for the translation editor: dialogue text and notes, control
 * and reference chips, glossary keys and values, and every name-table value.
 *
 * Case-insensitive substring matching. The typed query is debounced before it
 * reaches the (memoized) scan, so typing stays smooth across a few hundred
 * entries and the scan re-runs only when the applied query or the set itself
 * actually changes. Nothing here touches storage — it is pure derivation from
 * the set the editor already has in memory.
 */
import { useEffect, useMemo, useState } from 'react';
import type { LanguageSet } from '@shared/game/language';
import type { TranslationSearchState } from '../language-editor.type';
import { findTranslationHits } from './find-translation-hits';

const SEARCH_DEBOUNCE_MS = 180;

const NO_HITS: TranslationSearchState['hits'] = [];

const useTranslationSearch = (set: LanguageSet | null, query: string): TranslationSearchState => {
  const typed = query.trim();
  const [applied, setApplied] = useState(typed);

  useEffect(() => {
    const timer = setTimeout(() => setApplied(typed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  const hits = useMemo(
    () => (set && applied.length > 0 ? findTranslationHits(set, applied.toLowerCase()) : NO_HITS),
    [applied, set],
  );

  return { hits, count: hits.length, applied, pending: applied !== typed };
};

export { SEARCH_DEBOUNCE_MS, useTranslationSearch };
