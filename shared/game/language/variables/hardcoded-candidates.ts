/* @layer shared-game @kind logic */
/**
 * The search list behind the hardcoded-noun scan: every spelling worth looking
 * for, paired with the variable a line saying it should reference instead.
 *
 * The needles are the SET'S OWN variables, and only those: a term or a menu name
 * the translator has defined is the answer whenever its text turns up in a line.
 * Their values came out of the player's own file, which is the only place the
 * game's own spellings may live. This repository ships none of them.
 *
 * Longest phrase first, and one candidate per spelling. That ordering is what
 * lets the scan claim the widest match: a line naming a castle should offer the
 * castle, not the wider region whose name is a prefix of it.
 */
import { isSearchablePhrase } from './scan-run';
import type { Variable } from './types';

/** One spelling to search for, and what it should become. */
type Candidate = {
  /** Key of the variable a match should reference. */
  variableKey: string;
  /** The literal spelling searched for. */
  phrase: string;
  /** Always true: every needle comes from a variable the set already holds. */
  exists: boolean;
};

const fromVariables = (variables: Variable[]): Candidate[] => variables.flatMap((variable) => (
  variable.kind === 'engine' || variable.value === null
    ? []
    : [{ variableKey: variable.key, phrase: variable.value, exists: true }]
));

/** First mention of a spelling wins, so an existing variable beats a proposal. */
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
export type { Candidate };
