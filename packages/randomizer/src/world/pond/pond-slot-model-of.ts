/* @layer shared-game @kind logic */
import { POND_SLOT_MODELS } from './pond-slot-models.constants';
import type { CheckId } from '@rotp/game-data';
import type { PondSlotModel } from './pond.type';

const pondSlotModelOf = (checkId: CheckId): PondSlotModel =>
  POND_SLOT_MODELS[checkId] ?? { lock: { kind: 'none' } };

export { pondSlotModelOf };
