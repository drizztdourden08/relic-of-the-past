/* @layer renderer-lib @kind logic */
import type { SaveSlotRef } from '@drizztdourden08/brock-port-kit';
import type { SaveKind } from '@rotp/game-core';

const msuKeyOf = (ref: SaveSlotRef): { kind: SaveKind; id: string | number } =>
  (ref.kind === 'quick' ? { kind: 'quick', id: ref.slot } : { kind: ref.kind, id: ref.id });

export { msuKeyOf };
