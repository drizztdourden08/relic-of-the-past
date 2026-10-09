/* @layer renderer-components @kind logic */
import type { GlossaryTerm, LanguageSet } from '@rotp/languages';

const withGlossaryTerm = (set: LanguageSet, term: GlossaryTerm): LanguageSet => {
  const at = set.glossary.findIndex((entry) => entry.key === term.key);
  const glossary = at < 0
    ? [...set.glossary, term]
    : set.glossary.map((entry, i) => (i === at ? term : entry));
  return { ...set, glossary };
};

export { withGlossaryTerm };
