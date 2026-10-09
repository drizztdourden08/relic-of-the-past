/* @layer hub-core @kind logic */
import { groupCache } from './group-cache';

const invalidateGroups = (): void => {
  groupCache.entry = null;
};

export { invalidateGroups };
