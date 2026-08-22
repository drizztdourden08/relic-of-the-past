/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { Token } from '../types';

/**
 * One problem found in a dialogue entry's tokens, surfaced live in the
 * translation editor before a bake attempt would fail.
 */
type EntryIssue =
  | { kind: 'char-not-in-alphabet'; ch: string }
  | { kind: 'ref-unresolved'; key: string };

/**
 * Walk one `text` token's string the same way the encoder's greedy matcher
 * does (`encodeGreedyFromDict` in dialogue-encoder.ts, alphabet branch): a
 * `[...]`-bracketed run is matched whole against the alphabet, everything
 * else is matched one character at a time. Dictionary matching is not
 * simulated — every dictionary entry is itself composed of alphabet
 * characters (encodeDictionary enforces this), so skipping it never turns a
 * bake-time success into a reported failure here.
 */
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

/**
 * Predict, without baking, whether a dialogue entry's tokens will encode
 * cleanly: every `text` token's characters must resolve against the
 * language's alphabet, and every `ref` token's key must resolve against the
 * glossary. `cmd`/`break`/`var` tokens are assumed well-formed by the editor
 * and are not checked here.
 */
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
export type { EntryIssue };
