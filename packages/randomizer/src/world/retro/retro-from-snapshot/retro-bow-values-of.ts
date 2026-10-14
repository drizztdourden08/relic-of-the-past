/* @layer shared-game @kind logic */
import { RETRO_BOW_KEY, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY } from '../retro-bow.constants';
import type { OptionValue } from '../../options.type';
import type { RetroBowSetting } from '../retro.type';

const retroBowValuesOf = (setting: Partial<RetroBowSetting> | undefined): Record<string, OptionValue> => ({
  [RETRO_BOW_KEY]: setting?.enabled as OptionValue,
  [RETRO_WOOD_COST_KEY]: setting?.woodArrowCost as OptionValue,
  [RETRO_SILVER_COST_KEY]: setting?.silverArrowCost as OptionValue,
});

export { retroBowValuesOf };
