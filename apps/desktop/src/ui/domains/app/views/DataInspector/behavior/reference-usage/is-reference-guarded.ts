/* @layer renderer-app @kind logic */
import { REFERENCE_TARGETS } from '@shared/game/data/relationships/reference-index';
import type { ReferenceTarget } from '@shared/game/data/relationships/reference-index';

const isReferenceGuarded = (collectionKind: string): collectionKind is ReferenceTarget =>
  (REFERENCE_TARGETS as readonly string[]).includes(collectionKind);

export { isReferenceGuarded };
