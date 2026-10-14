/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { Token } from '../types';
import type { EntryIssue } from './validate.type';

const readBracket = (text: string, from: number): { bracketed: string; next: number } | null => {
  if (text[from] !== '[') return null;
  const closeAt = text.indexOf(']', from);
  if (closeAt < 0) return null;
  return { bracketed: text.slice(from, closeAt + 1), next: closeAt + 1 };
};

const findInvalidChars = (text: string, alphabet: ReadonlySet<string>): string[] => {
  const offenders: string[] = [];
  let i = 0;

  while (i < text.length) {
    const bracket = readBracket(text, i);
    if (bracket) {
      if (!alphabet.has(bracket.bracketed)) offenders.push(bracket.bracketed);
      i = bracket.next;
      continue;
    }

    const ch = text.charAt(i);
    if (!alphabet.has(ch)) offenders.push(ch);
    i += 1;
  }

  return offenders;
};

const newCharIssues = (text: string, alphabet: ReadonlySet<string>, seenChars: Set<string>): EntryIssue[] => {
  const issues: EntryIssue[] = [];
  for (const ch of findInvalidChars(text, alphabet)) {
    if (seenChars.has(ch)) continue;
    seenChars.add(ch);
    issues.push({ kind: 'char-not-in-alphabet', ch });
  }
  return issues;
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
      issues.push(...newCharIssues(token.v, alphabet, seenChars));
    } else if (token.t === 'ref' && !glossaryKeys.has(token.key)) {
      issues.push({ kind: 'ref-unresolved', key: token.key });
    }
  }

  return issues;
};

export { validateEntry };
