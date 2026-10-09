/* @layer renderer-hooks @kind logic */
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';

const emptyGroups = <T extends string>(tabs: readonly T[]): Record<T, LockedOptionGroup[]> => {
  const byTab = {} as Record<T, LockedOptionGroup[]>;
  for (const tab of tabs) byTab[tab] = [];
  return byTab;
};

export { emptyGroups };
