/* @layer renderer-hooks @kind logic */
import { reconcileCapacityPond } from '@shared/randomizer/world/capacity-pond';
import type { ReconciledCapacityPond } from '@shared/randomizer/world/capacity-pond';
import { capacityPondOf } from '../randomizer-choices';
import type { RandomizerOptionChoices } from '../randomizer-choices';

const capacityPondStateOf = (choices: RandomizerOptionChoices): ReconciledCapacityPond =>
  reconcileCapacityPond(capacityPondOf(choices));

export { capacityPondStateOf };
