/* @layer tests @kind type */
import type { EntityKind } from '@rotp/game-data';

interface RecordReference {
  from: string;
  field: string;
  kind: EntityKind;
  id: string;
}

type Sink = (kind: EntityKind, field: string, id: string | undefined | null) => void;

export type { RecordReference, Sink };
