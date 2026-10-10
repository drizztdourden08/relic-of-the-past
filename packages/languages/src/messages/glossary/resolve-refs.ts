/* @layer shared-game @kind logic */
import type { GlossaryTerm, Token } from '../types';

const appendText = (resolved: Token[], text: string): void => {
  const lastToken = resolved.at(-1);
  if (lastToken?.t === 'text') {
    lastToken.v += text;
  } else {
    resolved.push({ t: 'text', v: text });
  }
};

const resolveRefs = (tokens: Token[], glossary: GlossaryTerm[]): Token[] => {
  const glossaryMap = new Map(glossary.map(term => [term.key, term.value]));
  const resolved: Token[] = [];

  for (const token of tokens) {
    if (token.t === 'ref') {
      const value = glossaryMap.get(token.key);
      if (value === undefined) {
        throw new Error(`Missing glossary term: "${token.key}"`);
      }
      appendText(resolved, value);
    } else if (token.t === 'text') {
      appendText(resolved, token.v);
    } else {
      resolved.push(token);
    }
  }

  return resolved;
};

export { resolveRefs };
