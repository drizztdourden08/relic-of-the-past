/* @layer renderer-lib @kind logic */
import type { CapacityPondSelection } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from './randomizer-choices.type';

const capacityPondOf = (choices: RandomizerOptionChoices): CapacityPondSelection => ({
  enabled: choices.capacityEnabled,
  capacity: choices.capacity,
  pond: choices.ponds.capacity,
  retroBow: choices.retroBow?.enabled === true,
});

export { capacityPondOf };
