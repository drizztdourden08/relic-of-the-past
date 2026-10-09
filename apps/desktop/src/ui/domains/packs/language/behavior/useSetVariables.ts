/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { buildVariableIndex } from '@rotp/languages';
import type { LanguageSet } from '@rotp/languages';
import { literalTermsOf, variablesOf } from './set-variables';
import type { SetVariables } from './language-behavior.type';

const useSetVariables = (set: LanguageSet): SetVariables => {
  const { glossary, names, variables: stored } = set;
  const variables = useMemo(() => variablesOf(glossary, names, stored), [glossary, names, stored]);
  const terms = useMemo(() => literalTermsOf(variables), [variables]);
  const index = useMemo(() => buildVariableIndex(variables), [variables]);
  return useMemo(() => ({ variables, terms, index }), [variables, terms, index]);
};

export { useSetVariables };
export type { SetVariables } from './language-behavior.type';
