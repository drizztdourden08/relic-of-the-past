/* @layer shared-game @kind logic */
import { POND_MAX_ITEMS } from '../pond-ladder.constants';
import { pondRungKey } from '../../location-key';
import type { LocationKey } from '../../location-key';
import type { PondInstance } from '../pond-instance.type';

const recordedRung = (pond: PondInstance, rung: number): LocationKey | undefined =>
  pond.slots.find((slot) => slot.ladder === undefined && slot.rung === rung)?.key;

const pondRungsOf = (pond: PondInstance): readonly LocationKey[] =>
  Array.from({ length: POND_MAX_ITEMS }, (_unused, index) =>
    recordedRung(pond, index + 1) ?? pondRungKey(pond.id, index + 1));

export { pondRungsOf };
