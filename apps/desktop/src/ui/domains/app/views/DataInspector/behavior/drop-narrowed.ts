/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import { narrowedOptionCache } from './narrowed-option-cache';

const dropNarrowed = (kind: EntityKind): void => {
  for (const key of [...narrowedOptionCache.keys()]) {
    if (key.startsWith(`${kind}|`)) narrowedOptionCache.delete(key);
  }
};

export { dropNarrowed };
