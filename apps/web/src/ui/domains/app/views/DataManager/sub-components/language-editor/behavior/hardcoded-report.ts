/* @layer renderer-components @kind logic */
/**
 * The hardcoded-name scan grouped per variable, not per occurrence: a proper
 * noun appears dozens of times, and the decision is "should every mention
 * become a reference". Near misses (case-insensitive matches) are counted but
 * never applied, since applying one would recase a deliberate line.
 */
import type { Occurrence, Variable } from '@shared/game/language';

/** One variable's worth of the scan. */
type HardcodedGroup = {
  variableKey: string;
  /** What a reader calls it: the variable's own label, or the phrase itself. */
  label: string;
  /** The literal text found in the lines. */
  text: string;
  /** False when the catalog proposed a variable the set does not carry yet. */
  exists: boolean;
  /** Occurrences safe to swap, in reading order. */
  exact: Occurrence[];
  /** Matches that differ only in case, reported and never rewritten. */
  caseMisses: number;
  /** Distinct entries the exact occurrences sit in. */
  entryCount: number;
};

const emptyGroup = (occurrence: Occurrence): HardcodedGroup => ({
  variableKey: occurrence.variableKey,
  label: occurrence.variableKey,
  text: occurrence.text,
  exists: occurrence.exists,
  exact: [],
  caseMisses: 0,
  entryCount: 0,
});

const labelled = (group: HardcodedGroup, variables: Variable[]): HardcodedGroup => {
  const variable = variables.find((candidate) => candidate.key === group.variableKey);
  return variable === undefined ? group : { ...group, label: variable.label };
};

const countEntries = (occurrences: Occurrence[]): number =>
  new Set(occurrences.map((occurrence) => occurrence.entryId)).size;

/** Groups, most-found first. A variable with only near misses still appears, so the reader sees why. */
const groupHardcoded = (occurrences: Occurrence[], variables: Variable[]): HardcodedGroup[] => {
  const groups = new Map<string, HardcodedGroup>();

  for (const occurrence of occurrences) {
    const group = groups.get(occurrence.variableKey) ?? emptyGroup(occurrence);
    if (occurrence.match === 'exact') group.exact.push(occurrence);
    else group.caseMisses += 1;
    groups.set(occurrence.variableKey, group);
  }

  return [...groups.values()]
    .map((group) => labelled({ ...group, entryCount: countEntries(group.exact) }, variables))
    .sort((a, b) => b.exact.length - a.exact.length);
};

/** The sentence stating what stays behind, or empty when nothing does. */
const caseMissNote = (misses: number): string => (
  misses === 0 ? '' : `${misses} differ in case and stay as they are`
);

/** Every applicable occurrence across the chosen groups. */
const acceptedOf = (groups: HardcodedGroup[], chosen: ReadonlySet<string>): Occurrence[] =>
  groups.filter((group) => chosen.has(group.variableKey)).flatMap((group) => group.exact);

export { acceptedOf, caseMissNote, groupHardcoded };
export type { HardcodedGroup };
