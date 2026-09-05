/* @layer renderer-components @kind hook */
/**
 * Full-set search: dialogue text and notes, chips, glossary keys and values,
 * and every name-table value. Case-insensitive substring matching; the query
 * is debounced before it reaches the memoized scan.
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
