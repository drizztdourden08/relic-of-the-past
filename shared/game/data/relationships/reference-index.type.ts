/* @layer shared-game @kind types */
import type { EntityKind } from '../types';

interface ReferenceHit {
  kind: EntityKind;
  id: string;
  field: string;
}

export type { ReferenceHit };
