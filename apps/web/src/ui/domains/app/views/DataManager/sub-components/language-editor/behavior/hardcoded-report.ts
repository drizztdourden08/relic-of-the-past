/* @layer renderer-components @kind logic */
/**
 * The hardcoded-name scan, arranged the way a translator reads it: one group
 * per variable rather than one row per occurrence.
 *
 * A proper noun typically appears dozens of times, and a list of dozens of
 * identical rows is a list nobody audits. Grouping puts the decision where it
 * belongs — "should every mention of this name become a reference" — and keeps
 * the per-line detail available underneath.
 *
 * Near misses are counted, never folded into the group's applicable total. They
 * matched only with case ignored, so applying one would recase a line someone
 * wrote that way on purpose; the group reports them as a sentence and leaves
 * them exactly as they are.
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

/**
 * The scan as groups, most-found first so the biggest win is at the top. A
 * variable with nothing but near misses still appears: "nothing to apply here,
 * and here is why" is the answer a translator came for.
 */
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
