/* @layer renderer-components @kind logic */
import type { GlossaryTerm, Token } from '@rotp/languages';

const measurableGlossary = (tokens: Token[], glossary: GlossaryTerm[]): GlossaryTerm[] => {
  const known = new Set(glossary.map((term) => term.key));
  const missing = new Set<string>();
  for (const token of tokens) {
    if (token.t === 'ref' && !known.has(token.key)) missing.add(token.key);
  }
  if (missing.size === 0) return glossary;
  return [...glossary, ...[...missing].map((key) => ({ key, value: key }))];
};

export { measurableGlossary };
