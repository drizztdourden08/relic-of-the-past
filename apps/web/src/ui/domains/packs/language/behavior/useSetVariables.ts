/* @layer renderer-components @kind hook */
/**
 * A set's variables as a viewer reads them: the one list, the literal terms the measuring walks
 * take, and the index an entry's prose is expanded with. Keyed on the three stored fields, so a
 * new set object with the same tables keeps every layout already measured.
 */
import { useMemo } from 'react';
import { buildVariableIndex } from '@shared/game/language';
import type { GlossaryTerm, LanguageSet, Variable, VariableIndex } from '@shared/game/language';
import { literalTermsOf, variablesOf } from './set-variables';

type SetVariables = {
  variables: Variable[];
  terms: GlossaryTerm[];
  index: VariableIndex;
};

const useSetVariables = (set: LanguageSet): SetVariables => {
  const { glossary, names, variables: stored } = set;
  const variables = useMemo(() => variablesOf(glossary, names, stored), [glossary, names, stored]);
  const terms = useMemo(() => literalTermsOf(variables), [variables]);
  const index = useMemo(() => buildVariableIndex(variables), [variables]);
  return useMemo(() => ({ variables, terms, index }), [variables, terms, index]);
};

export { useSetVariables };
export type { SetVariables };
