/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { Token } from '../types';
import type { EntryIssue } from './validate.type';

const findInvalidChars = (text: string, alphabet: ReadonlySet<string>): string[] => {
  const offenders: string[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '[') {
      const closeAt = text.indexOf(']', i);
      if (closeAt >= 0) {
        const bracketed = text.slice(i, closeAt + 1);
        if (alphabet.has(bracketed)) {
          i = closeAt + 1;
          continue;
        }
        offenders.push(bracketed);
        i = closeAt + 1;
        continue;
      }
    }

    const ch = text[i];
    if (!alphabet.has(ch)) offenders.push(ch);
    i += 1;
  }

  return offenders;
};

const validateEntry = (
  tokens: Token[],
  cfg: LanguageConfig,
  glossaryKeys: ReadonlySet<string>,
): EntryIssue[] => {
  const alphabet = new Set(cfg.alphabet);
  const seenChars = new Set<string>();
  const issues: EntryIssue[] = [];

  for (const token of tokens) {
    if (token.t === 'text') {
      for (const ch of findInvalidChars(token.v, alphabet)) {
        if (seenChars.has(ch)) continue;
        seenChars.add(ch);
        issues.push({ kind: 'char-not-in-alphabet', ch });
      }
    } else if (token.t === 'ref' && !glossaryKeys.has(token.key)) {
      issues.push({ kind: 'ref-unresolved', key: token.key });
    }
  }

  return issues;
};

export { validateEntry };
