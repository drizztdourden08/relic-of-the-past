/* @layer shared-game @kind logic */
import { all } from '../registry';
import type { EntityKind, EntityOf } from '../types';

const find = <K extends EntityKind>(kind: K, predicate: (record: EntityOf<K>) => boolean): EntityOf<K>[] =>
  all(kind).filter(predicate);

export { find };
