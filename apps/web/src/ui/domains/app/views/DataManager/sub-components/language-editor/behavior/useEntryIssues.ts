/* @layer renderer-components @kind hook */
/**
 * Live per-entry validation, incremental: edits are immutable, so a cache
 * keyed by entry id and compared by `tokens` identity re-validates only the
 * entry that changed. The base language and the reference key set invalidate
 * the whole cache, via a cheap signature. The keys come from the whole
 * substitution list, not the glossary alone, since menu names are referenceable.
 */
import { useMemo, useRef } from 'react';
import type { EntryIssue, GlossaryTerm, LanguageSet, Token } from '@shared/game/language';
import { validateEntry } from '@shared/game/language';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import type { EntryIssueMap } from '../language-editor.type';

type CacheRow = { tokens: Token[]; issues: EntryIssue[] };

const NO_ISSUES: EntryIssueMap = {};

const useEntryIssues = (set: LanguageSet | null, terms: GlossaryTerm[]): EntryIssueMap => {
  const cache = useRef<Map<number, CacheRow>>(new Map());
  const signature = useRef<string>('');

  const base = set?.base;
  const dialogue = set?.dialogue;

  const refKeys = useMemo(() => new Set(terms.map((term) => term.key)), [terms]);

  // The validator's alphabet comes from the extraction language table via the base code.
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
