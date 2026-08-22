/* @layer renderer-components @kind hook */
/**
 * Live per-entry validation, incremental by design.
 *
 * A set holds a few hundred entries, so re-running the validator over all of
 * them on every keystroke is not an option. Edits are immutable, so only the
 * edited entry gets a fresh `tokens` array: a cache keyed by entry id and
 * compared by array identity therefore re-validates exactly the one entry that
 * changed and reuses every other result untouched.
 *
 * Two things invalidate the whole cache rather than one entry — the set's base
 * language (a different alphabet) and the glossary key set (which references
 * resolve). Both are compared by a cheap signature.
 */
import { useMemo, useRef } from 'react';
import type { EntryIssue, LanguageSet, Token } from '@shared/game/language';
import { validateEntry } from '@shared/game/language';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import type { EntryIssueMap } from '../language-editor.type';

type CacheRow = { tokens: Token[]; issues: EntryIssue[] };

const NO_ISSUES: EntryIssueMap = {};

const useEntryIssues = (set: LanguageSet | null): EntryIssueMap => {
  const cache = useRef<Map<number, CacheRow>>(new Map());
  const signature = useRef<string>('');

  const glossary = set?.glossary;
  const base = set?.base;
  const dialogue = set?.dialogue;

  const glossaryKeys = useMemo(
    () => new Set((glossary ?? []).map((term) => term.key)),
    [glossary],
  );

  // The validator reads its alphabet/dictionary from the extraction language
  // table, resolved through the set's declared base language code.
  const config = useMemo(() => (base ? kLanguages[base] ?? null : null), [base]);

  return useMemo(() => {
    if (!dialogue || !config) return NO_ISSUES;

    const next = `${base ?? ''}|${[...glossaryKeys].sort().join('\u0000')}`;
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
      const found = validateEntry(entry.tokens, config, glossaryKeys);
      cache.current.set(entry.id, { tokens: entry.tokens, issues: found });
      issues[entry.id] = found;
    }
    return issues;
  }, [base, config, dialogue, glossaryKeys]);
};

export { useEntryIssues };
