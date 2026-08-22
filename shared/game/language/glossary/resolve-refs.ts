/* @layer shared-game @kind logic */
import type { GlossaryTerm, Token } from '../types';

/**
 * Replace all `ref` tokens in the token stream with their corresponding
 * glossary term values, merging adjacent text tokens that result from the
 * replacement.
 *
 * Throws if a ref points to a missing glossary key.
 */
const resolveRefs = (tokens: Token[], glossary: GlossaryTerm[]): Token[] => {
  const glossaryMap = new Map(glossary.map(term => [term.key, term.value]));
  const resolved: Token[] = [];

  for (const token of tokens) {
    if (token.t === 'ref') {
      const value = glossaryMap.get(token.key);
      if (value === undefined) {
        throw new Error(`Missing glossary term: "${token.key}"`);
      }
      // Merge with previous text token if possible
      const lastToken = resolved[resolved.length - 1];
      if (lastToken !== undefined && lastToken.t === 'text') {
        lastToken.v += value;
      } else {
        resolved.push({ t: 'text', v: value });
      }
    } else if (token.t === 'text') {
      // Merge with previous text token if possible; always copy so a later
      // merge never appends into a token object owned by the caller
      const lastToken = resolved[resolved.length - 1];
      if (lastToken !== undefined && lastToken.t === 'text') {
        lastToken.v += token.v;
      } else {
        resolved.push({ t: 'text', v: token.v });
      }
    } else {
      // All other token kinds pass through unchanged
      resolved.push(token);
    }
  }

  return resolved;
};

export { resolveRefs };
