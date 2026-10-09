/* @layer shared-game @kind logic */
import { all } from '../../registry';
import type { EntityKind, EntityOf } from '../../types';
import type { ReferenceHit } from '../reference-index.type';

const scanReferences = <K extends EntityKind>(
  kind: K,
  field: string,
  matches: (record: EntityOf<K>) => boolean,
): ReferenceHit[] =>
  all(kind).filter(matches).map(record => ({ kind, id: (record as { id: string }).id, field }));

export { scanReferences };
