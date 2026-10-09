/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key';
import type { PondInstance } from '../pond-instance.type';

const pondCertifiedSpotsOf = (pond: PondInstance): readonly LocationKey[] =>
  pond.slots.map((slot) => slot.key);

export { pondCertifiedSpotsOf };
