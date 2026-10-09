/* @layer shared-game @kind logic */
import { rebuild } from '../indexes';
import { replaceAll } from '../registry';
import type { EntityKind, EntityOf } from '../types';

const commitRecords = (kind: EntityKind, records: readonly unknown[]): void => {
  replaceAll(kind, records as readonly EntityOf<EntityKind>[]);
  rebuild();
};

export { commitRecords };
