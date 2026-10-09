/* @layer shared-game @kind logic */
import { all } from '../registry';
import type { EntityKind, EntityOf } from '../types';

const findOne = <K extends EntityKind>(kind: K, predicate: (record: EntityOf<K>) => boolean): EntityOf<K> | undefined =>
  all(kind).find(predicate);

export { findOne };
