/* @layer shared-game @kind types */
import type { EntityKind } from '../types';

/** One place a `TagId` or an `ItemGroupId` is actually referenced. */
interface ReferenceHit {
  kind: EntityKind;
  id: string;
  field: string;
}

export type { ReferenceHit };
