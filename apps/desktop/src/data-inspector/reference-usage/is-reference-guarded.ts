/* @layer renderer-app @kind logic */
import { REFERENCE_TARGETS } from '@rotp/game-data';
import type { ReferenceTarget } from '@rotp/game-data';

const isReferenceGuarded = (collectionKind: string): collectionKind is ReferenceTarget =>
  (REFERENCE_TARGETS as readonly string[]).includes(collectionKind);

export { isReferenceGuarded };
