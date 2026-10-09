/* @layer shared-game @kind logic */
import { all } from '../registry';
import type { EntityKind } from '../types';
import { commitRecords } from './commit-records';
import { idOf } from './id-of';

const unregisterRecord = (kind: EntityKind, id: string): boolean => {
  const held: readonly unknown[] = all(kind);
  const next = held.filter(entry => idOf(entry) !== id);
  if (next.length === held.length) return false;
  commitRecords(kind, next);
  return true;
};

export { unregisterRecord };
