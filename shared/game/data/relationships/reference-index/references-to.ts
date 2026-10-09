/* @layer shared-game @kind logic */
import type { ReferenceHit } from '../reference-index.type';
import type { ReferenceTarget } from './reference-index.type';
import { REVERSE_INDEX } from './reference-index.constants';

const referencesTo = (targetKind: ReferenceTarget, id: string): ReferenceHit[] =>
  REVERSE_INDEX[targetKind](id);

export { referencesTo };
