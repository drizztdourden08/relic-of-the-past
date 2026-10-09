/* @layer shared-game @kind logic */
import { isSearchablePhrase } from './is-searchable-phrase';
import type { Candidate, Variable } from './types';

const fromVariables = (variables: Variable[]): Candidate[] => variables.flatMap((variable) => (
  variable.kind === 'engine' || variable.value === null
    ? []
    : [{ variableKey: variable.key, phrase: variable.value, exists: true }]
));

const firstPerPhrase = (candidates: Candidate[]): Candidate[] => {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.phrase)) return false;
    seen.add(candidate.phrase);
    return true;
  });
};

const hardcodedCandidates = (variables: Variable[]): Candidate[] => {
  const all = fromVariables(variables)
    .filter((candidate) => isSearchablePhrase(candidate.phrase));

  return firstPerPhrase(all).sort((a, b) => b.phrase.length - a.phrase.length);
};

export { hardcodedCandidates };
