/* @layer shared-game @kind logic */
/**
 * The retro rows ⇄ the setting they stand for, both directions in one file so
 * the reading the generator uses and the writing the creation form freezes can
 * never spell the same option two ways, the contract every other block here
 * keeps.
 *
 * A snapshot frozen before these rows existed carries none of them: the switch
 * falls back to off, which is the pool and the logic every stored placement was
 * generated under, and the costs to the reference's own two numbers.
 *
 * A cost is read under the wallet the same snapshot describes
 * (retro-cost-ceiling.ts): a stored number above what that wallet can hold at
 * once is held at the ceiling instead of left to make the seed refuse, so the
 * reading the generator uses is always one the sliders would have offered.
 */
import { parseCapacityProfile } from '../capacity/capacity-profile-from-snapshot';
import {
  DEFAULT_RETRO_BOW, RETRO_BOW_KEY, RETRO_PRICE_CEILING, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY,
} from './retro-bow.data';
import { heldRetroBow, retroCostCeilingsOf } from './retro-cost-ceiling';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { RetroBowSetting } from './retro.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const costAt = (values: Values, key: string, fallback: number): number => {
  const raw = values[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback;
  return Math.min(RETRO_PRICE_CEILING, Math.max(0, Math.trunc(raw)));
};

/** The rows as stored, before the wallet has its say. */
const storedRetroBowOf = (values: Values): RetroBowSetting => ({
  enabled: values[RETRO_BOW_KEY] === true,
  woodArrowCost: costAt(values, RETRO_WOOD_COST_KEY, DEFAULT_RETRO_BOW.woodArrowCost),
  silverArrowCost: costAt(values, RETRO_SILVER_COST_KEY, DEFAULT_RETRO_BOW.silverArrowCost),
});

const retroBowOfValues = (values: Values): RetroBowSetting =>
  heldRetroBow(storedRetroBowOf(values), retroCostCeilingsOf(parseCapacityProfile(values).profile));

const retroBowFromSnapshot = (snapshot: RandomizerOptionsSnapshot): RetroBowSetting =>
  retroBowOfValues(snapshot.values);

/**
 * The rows a setting freezes: what the creation form hands the catalog. A
 * setting the choices never carried writes its keys with nothing behind them
 * instead of with the defaults, for the same reason the mode rows do: the
 * wiring guard reads the frozen map by value and an unwired field has to show
 * there.
 */
const retroBowValuesOf = (setting: RetroBowSetting): Record<string, ApOptionValue> => ({
  [RETRO_BOW_KEY]: setting?.enabled as ApOptionValue,
  [RETRO_WOOD_COST_KEY]: setting?.woodArrowCost as ApOptionValue,
  [RETRO_SILVER_COST_KEY]: setting?.silverArrowCost as ApOptionValue,
});

/** A fresh mutable-safe copy for a creation form. */
const defaultRetroBow = (): RetroBowSetting => ({ ...DEFAULT_RETRO_BOW });

export { defaultRetroBow, retroBowFromSnapshot, retroBowOfValues, retroBowValuesOf, storedRetroBowOf };
