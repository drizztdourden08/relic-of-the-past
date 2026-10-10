/* @layer renderer-components @kind logic */
import type { LanguageSet } from '@rotp/languages';

const withoutGlossaryTerm = (set: LanguageSet, key: string): LanguageSet => {
  const glossary = set.glossary.filter((entry) => entry.key !== key);
  return glossary.length === set.glossary.length ? set : { ...set, glossary };
};

export { withoutGlossaryTerm };
