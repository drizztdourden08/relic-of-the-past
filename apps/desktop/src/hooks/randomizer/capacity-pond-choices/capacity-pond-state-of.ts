/* @layer renderer-hooks @kind logic */
import { reconcileCapacityPond } from '@rotp/randomizer';
import type { ReconciledCapacityPond } from '@rotp/randomizer';
import { capacityPondOf } from '../randomizer-choices';
import type { RandomizerOptionChoices } from '../randomizer-choices';

const capacityPondStateOf = (choices: RandomizerOptionChoices): ReconciledCapacityPond =>
  reconcileCapacityPond(capacityPondOf(choices));

export { capacityPondStateOf };
