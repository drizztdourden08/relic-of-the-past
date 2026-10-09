/* @layer shared-game @kind logic */
import {
  DEFAULT_RETRO_BOW, RETRO_BOW_KEY, RETRO_PRICE_CEILING, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY,
} from '../retro-bow.constants';
import type { OptionValues } from '../../options.type';
import type { RetroBowSetting } from '../retro.type';

const costAt = (values: OptionValues, key: string, fallback: number): number => {
  const raw = values[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback;
  return Math.min(RETRO_PRICE_CEILING, Math.max(0, Math.trunc(raw)));
};

const storedRetroBowOf = (values: OptionValues): RetroBowSetting => ({
  enabled: values[RETRO_BOW_KEY] === true,
  woodArrowCost: costAt(values, RETRO_WOOD_COST_KEY, DEFAULT_RETRO_BOW.woodArrowCost),
  silverArrowCost: costAt(values, RETRO_SILVER_COST_KEY, DEFAULT_RETRO_BOW.silverArrowCost),
});

export { storedRetroBowOf };
