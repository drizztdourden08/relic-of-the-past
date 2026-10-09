/* @layer renderer-components @kind logic */
import type { Occurrence, Variable } from '@rotp/languages';
import type { HardcodedGroup } from './hardcoded-report.type';

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

export { groupHardcoded };
