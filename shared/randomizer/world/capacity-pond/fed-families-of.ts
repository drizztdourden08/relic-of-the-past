/* @layer shared-game @kind logic */
import { isPinnedUnderRetro } from '../capacity/retro-projectiles';
import { POND_FED_FAMILIES } from './capacity-pond.constants';
import type { PondFedFamily } from './capacity-pond-rule.type';

const fedFamiliesOf = (retroBow: boolean): readonly PondFedFamily[] =>
  POND_FED_FAMILIES.filter((family) => !isPinnedUnderRetro(family, retroBow));

export { fedFamiliesOf };
