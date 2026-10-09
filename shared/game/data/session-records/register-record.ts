/* @layer shared-game @kind logic */
import { all } from '../registry';
import type { EntityKind } from '../types';
import type { AnyRecord } from './session-records.type';
import { commitRecords } from './commit-records';
import { idOf } from './id-of';

const registerRecord = (kind: EntityKind, record: AnyRecord): boolean => {
  const held: readonly unknown[] = all(kind);
  if (held.some(entry => idOf(entry) === record.id)) return false;
  commitRecords(kind, [...held, record]);
  return true;
};

export { registerRecord };
