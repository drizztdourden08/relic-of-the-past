/* @layer renderer-lib @kind logic */
import { METER_LEVEL_LABELS } from '@shared/randomizer/world/capacity';
import type { CapacityFamily } from '@shared/randomizer/world/capacity';

const stopsOf = (capacityFamily: CapacityFamily): readonly string[] =>
  capacityFamily.id === 'meter' ? METER_LEVEL_LABELS : capacityFamily.ladder.map(String);

export { stopsOf };
