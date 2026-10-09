/* @layer shared-game @kind logic */
import { parseCapacityProfile } from '../../capacity/capacity-profile-from-snapshot';
import { heldRetroBow } from '../held-retro-bow';
import { retroCostCeilingsOf } from '../retro-cost-ceiling';
import { storedRetroBowOf } from './stored-retro-bow-of';
import type { OptionValues } from '../../options.type';
import type { RetroBowSetting } from '../retro.type';

const retroBowOfValues = (values: OptionValues): RetroBowSetting =>
  heldRetroBow(storedRetroBowOf(values), retroCostCeilingsOf(parseCapacityProfile(values).profile));

export { retroBowOfValues };
