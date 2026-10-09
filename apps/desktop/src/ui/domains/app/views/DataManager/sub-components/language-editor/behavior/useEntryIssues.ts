/* @layer renderer-components @kind hook */
import { useMemo, useRef } from 'react';
import type { GlossaryTerm, LanguageSet } from '@shared/game/language';
import { validateEntry } from '@shared/game/language';
import { kLanguages } from '@rotp/game-data';
import { NO_ISSUES } from './useEntryIssues.constants';
import type { EntryIssueMap } from '../language-editor.type';
import type { CacheRow } from './useEntryIssues.type';

const useEntryIssues = (set: LanguageSet | null, terms: GlossaryTerm[]): EntryIssueMap => {
  const cache = useRef<Map<number, CacheRow>>(new Map());
  const signature = useRef<string>('');

  const base = set?.base;
  const dialogue = set?.dialogue;

  const refKeys = useMemo(() => new Set(terms.map((term) => term.key)), [terms]);

  const config = useMemo(() => (base ? kLanguages[base] ?? null : null), [base]);

  return useMemo(() => {
    if (!dialogue || !config) return NO_ISSUES;

    const next = `${base ?? ''}|${[...refKeys].sort().join('\u0000')}`;
    if (next !== signature.current) {
      cache.current.clear();
      signature.current = next;
    }

    const issues: EntryIssueMap = {};
    for (const entry of dialogue) {
      const cached = cache.current.get(entry.id);
      if (cached && cached.tokens === entry.tokens) {
        issues[entry.id] = cached.issues;
        continue;
      }
      const found = validateEntry(entry.tokens, config, refKeys);
      cache.current.set(entry.id, { tokens: entry.tokens, issues: found });
      issues[entry.id] = found;
    }
    return issues;
  }, [base, config, dialogue, refKeys]);
};

export { useEntryIssues };
