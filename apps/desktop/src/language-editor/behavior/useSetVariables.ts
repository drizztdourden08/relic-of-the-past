/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { LanguageSet } from '@rotp/languages';
import { literalTermsOf, variablesOf } from '@rotp/design/packs';
import { NO_TERMS, NO_VARIABLES } from './language-editor.constants';

const useSetVariables = (set: LanguageSet | null) => {
  const glossary = set?.glossary;
  const names = set?.names;
  const stored = set?.variables;
  const variables = useMemo(
    () => (glossary === undefined || names === undefined
      ? NO_VARIABLES
      : variablesOf(glossary, names, stored)),
    [glossary, names, stored],
  );
  const terms = useMemo(
    () => (variables === NO_VARIABLES ? NO_TERMS : literalTermsOf(variables)),
    [variables],
  );
  return { variables, terms };
};

export { useSetVariables };
