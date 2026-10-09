/* @layer shared-game @kind logic */
import { ACTIVATED_FLUTE_DESCRIPTION, TIER_DESCRIPTION } from './progressive-tier-row.constants';
import type { OptionDescription } from '../option-description.type';
import type { ProgressiveFamilyDef } from './progressive.type';

const progressiveTierDescriptionOf = (family: ProgressiveFamilyDef, index: number): OptionDescription =>
  (family.id === 'ocarina' && index === 1 ? ACTIVATED_FLUTE_DESCRIPTION : TIER_DESCRIPTION);

export { progressiveTierDescriptionOf };
