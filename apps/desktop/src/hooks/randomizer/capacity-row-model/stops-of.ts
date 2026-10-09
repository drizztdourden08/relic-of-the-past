/* @layer renderer-lib @kind logic */
import { METER_LEVEL_LABELS } from '@rotp/randomizer';
import type { CapacityFamily } from '@rotp/randomizer';

const stopsOf = (capacityFamily: CapacityFamily): readonly string[] =>
  capacityFamily.id === 'meter' ? METER_LEVEL_LABELS : capacityFamily.ladder.map(String);

export { stopsOf };
